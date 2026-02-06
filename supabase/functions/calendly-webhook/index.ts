import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CalendlyInvitee {
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  text_reminder_number?: string;
  timezone?: string;
}

interface CalendlyEvent {
  uri: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface CalendlyWebhookPayload {
  event: string;
  payload: {
    event_type: {
      uri: string;
      name: string;
    };
    event: CalendlyEvent;
    invitee: CalendlyInvitee;
    questions_and_answers?: Array<{
      question: string;
      answer: string;
    }>;
    tracking?: {
      utm_campaign?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_content?: string;
      utm_term?: string;
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData: CalendlyWebhookPayload = await req.json();
    console.log('📥 Received Calendly webhook:', JSON.stringify(webhookData, null, 2));

    if (webhookData.event !== 'invitee.created') {
      console.log('⚠️ Event type not processed:', webhookData.event);
      return new Response(
        JSON.stringify({ message: 'Event type not processed', event: webhookData.event }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const event = webhookData.payload.event;
    const tracking = webhookData.payload.tracking || {};

    console.log('📊 Tracking data received from Calendly:', tracking);

    const eventStartTime = new Date(event.start_time).toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Europe/Paris'
    });

    const isFromGoogleAds = tracking.utm_source === 'google' || tracking.utm_source === 'googleads';

    console.log('🔍 Lead routing decision:', {
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      isFromGoogleAds,
      targetTable: 'prospects'
    });

    const leadData: any = {
      nom: 'RDV Calendly',
      email: 'calendly@rdv.com',
      creneau: eventStartTime,
      metadata: {
        utm_source: tracking.utm_source,
        utm_medium: tracking.utm_medium,
        utm_campaign: tracking.utm_campaign,
        source: isFromGoogleAds ? 'google_ads' : 'calendly',
        form: 'calendly_webhook'
      },
      statut: 'nouveau'
    };

    if (isFromGoogleAds) {
      leadData.utm_source = tracking.utm_source;
      leadData.utm_medium = tracking.utm_medium;
      leadData.utm_campaign = tracking.utm_campaign;
    } else {
      leadData.type_contact = 'calendly';
    }

    const { data, error } = await supabase
      .from('prospects')
      .insert([leadData])
      .select();

    if (error) {
    console.error('❌ Error inserting lead into prospects:', error);
      throw error;
    }

    console.log('✅ Lead created successfully in prospects:', data);

    return new Response(
      JSON.stringify({ success: true, lead: data }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
