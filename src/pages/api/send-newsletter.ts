import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from '../../lib/supabase';
import { sendNewsletter as sendEmail } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const signatureHeader = request.headers.get('X-Signature-SHA256');
    const body = await request.text();
    const { newsletterId } = JSON.parse(body);
    const secret = import.meta.env.PUBLIC_SEND_NEWSLETTER_SECRET;

    if (!signatureHeader || !secret) {
      return new Response(JSON.stringify({ message: 'No autorizado. Falta firma o secreto.' }), {
        status: 401,
      });
    }

    // 1. Verify the HMAC signature
    const hmac = createHmac('sha256', secret);
    hmac.update(body);
    const generatedSignature = hmac.digest('hex');

    let receivedSigBuffer: Buffer;
    try {
      // Support both 'sha256=...' and raw signature
      const signature = signatureHeader.startsWith('sha256=')
        ? signatureHeader.substring(7)
        : signatureHeader;
      receivedSigBuffer = Buffer.from(signature, 'hex');
    } catch (e) {
      return new Response(JSON.stringify({ message: 'Firma con formato incorrecto.' }), {
        status: 401,
      });
    }
    
    const generatedSigBuffer = Buffer.from(generatedSignature, 'hex');

    if (
      receivedSigBuffer.length !== generatedSigBuffer.length ||
      !timingSafeEqual(receivedSigBuffer, generatedSigBuffer)
    ) {
      return new Response(JSON.stringify({ message: 'Firma inválida.' }), {
        status: 401,
      });
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
