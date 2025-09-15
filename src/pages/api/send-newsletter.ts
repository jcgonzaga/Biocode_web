import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendNewsletter as sendEmail } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { newsletterId, secret } = await request.json();

    // 1. Verify the secret key
    if (secret !== import.meta.env.SEND_NEWSLETTER_SECRET) {
      return new Response(
        JSON.stringify({ message: 'No autorizado.' }),
        { status: 401 }
      );
    }

    // 2. Fetch the newsletter content from Supabase
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('subject, content_html')
      .eq('id', newsletterId)
      .single();

    if (newsletterError || !newsletter) {
      return new Response(
        JSON.stringify({ message: 'Newsletter no encontrada.' }),
        { status: 404 }
      );
    }

    // 3. Fetch all subscribers from Supabase
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email');

    if (subscribersError || !subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No hay subscriptores a los que enviar.' }),
        { status: 404 }
      );
    }

    // 4. Call the sendNewsletter function to send the email
    const result = await sendEmail(newsletter.subject, newsletter.content_html, subscribers);

    if (!result.success) {
      return new Response(
        JSON.stringify({ message: 'Error al enviar los correos.' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: '¡Newsletter enviada a todos los subscriptores!' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor.' }),
      { status: 500 }
    );
  }
};
