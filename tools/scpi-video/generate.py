#!/usr/bin/env python3
"""Offline 9:16 SCPI explainer. Requires Pillow and FFmpeg; no paid API."""
import argparse
import json
import math
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W,H=720,1280
NAVY="#091B32"
TEAL="#31D6C1"
WHITE="#F4F8FC"
MUTED="#B5C8D9"

def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"):
        if Path(p).exists(): return ImageFont.truetype(p,size)
    return ImageFont.load_default()

def wrap(draw,text,f,max_width):
    words=text.split()
    lines=[]; line=""
    for word in words:
        trial=(line+" "+word).strip()
        if draw.textbbox((0,0),trial,font=f)[2]>max_width and line:
            lines.append(line);line=word
        else:line=trial
    if line:lines.append(line)
    return lines

def block(draw,text,y,size=46,color=WHITE):
    f=font(size)
    for line in wrap(draw,text,f,W-100):
        draw.text((50,y),line,font=f,fill=color)
        y+=int(size*1.38)
    return y

def frame(data,stage):
    im=Image.new("RGB",(W,H),NAVY);d=ImageDraw.Draw(im)
    d.rounded_rectangle((36,42,684,132),radius=20,fill="#133451")
    d.text((58,65),"MAXIMUSSCPI",font=font(38),fill=TEAL)
    d.text((50,186),"COMPRENDRE LES SCPI",font=font(26),fill=MUTED)
    if stage==0:
        y=block(d,data["hook"],310,59)
        block(d,"Une comparaison fondée sur des données officielles",y+70,34,MUTED)
    elif stage==1:
        y=block(d,data["scpi_name"],240,52)
        value=data["metric_value"]
        d.text((50,y+110),value,font=font(108),fill=TEAL)
        block(d,data["metric_label"],y+260,40)
        block(d,"Source : "+data["source_title"],y+400,25,MUTED)
        block(d,"Situation au "+data["as_of"],y+470,25,MUTED)
    else:
        y=block(d,data["conclusion"],260,46)
        d.rounded_rectangle((45,y+100,675,y+300),radius=25,fill=TEAL)
        d.text((75,y+130),"Comparer les SCPI",font=font(42),fill=NAVY)
        d.text((75,y+210),"maximusscpi.com",font=font(35),fill=NAVY)
    d.line((50,1090,670,1090),fill="#38516B",width=2)
    block(d,"Les performances passées ne préjugent pas des performances futures.",1110,23,MUTED)
    block(d,"Capital et revenus non garantis. Risque de perte en capital.",1180,21,MUTED)
    return im

def main():
    p=argparse.ArgumentParser()
    p.add_argument("input",type=Path)
    p.add_argument("--output",type=Path,default=Path("scpi-video.mp4"))
    p.add_argument("--voice",type=Path,help="Optional pre-generated WAV narration, e.g. Piper")
    a=p.parse_args()
    data=json.loads(a.input.read_text(encoding="utf-8"))
    required=("hook","scpi_name","metric_value","metric_label","source_title","as_of","conclusion")
    for k in required:
        if not isinstance(data.get(k),str) or not data[k].strip():
            p.error("Missing non-empty field: "+k)
    if not data.get("source_url","").startswith("https://"):
        p.error("source_url must be an official HTTPS document link")
    a.output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        clips=[]
        for idx,duration in enumerate((5,7,6)):
            path=Path(tmp)/f"slide-{idx}.png"
            frame(data,idx).save(path)
            clip=Path(tmp)/f"clip-{idx}.mp4"
            subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1","-framerate","25","-i",str(path),"-t",str(duration),"-vf","format=yuv420p","-c:v","libx264","-pix_fmt","yuv420p",str(clip)],check=True)
            clips.append(clip)
        manifest=Path(tmp)/"concat.txt"
        manifest.write_text("".join("file '"+str(x)+"'\n" for x in clips))
        cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(manifest)]
        if a.voice:
            if not a.voice.is_file(): p.error("Voice WAV not found")
            cmd+=["-i",str(a.voice),"-map","0:v:0","-map","1:a:0","-c:a","aac","-shortest"]
        else:cmd+=["-an"]
        cmd+=["-c:v","copy",str(a.output)]
        subprocess.run(cmd,check=True)
    print(a.output)

if __name__=="__main__":main()
