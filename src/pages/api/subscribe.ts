import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendVerificationEmail } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ message: 'Nombre y email son requeridos.' }), { status: 400 });
    }

    // Check if email already exists in the final subscribers table
    const { data: existingSubscriber } = await supabase.from('subscribers').select('email').eq('email', email).single();
    if (existingSubscriber) {
      return new Response(JSON.stringify({ message: 'Este email ya está subscrito.' }), { status: 409 });
    }

    // Insert into pending_subscribers and get the verification_token
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_subscribers')
      .insert({ name, email })
      .select('verification_token')
      .single();

    if (pendingError) {
      console.error('Supabase error (pending): ', pendingError);
      if (pendingError.code === '23505') {
        // This means the email is already in the pending table.
        // You might want to resend the verification email here if you store the token.
        return new Response(JSON.stringify({ message: 'Ya te has registrado. Por favor, revisa tu correo para el enlace de verificación.' }), { status: 409 });
      }
      return new Response(JSON.stringify({ message: 'Error en el registro.' }), { status: 500 });
    }

    if (!pendingData) {
        return new Response(JSON.stringify({ message: 'No se pudo obtener el token de verificación.' }), { status: 500 });
    }

    // Send verification email
    const { success } = await sendVerificationEmail(email, pendingData.verification_token);

    if (!success) {
      // Optional: You might want to delete the pending subscriber if the email fails
      return new Response(JSON.stringify({ message: 'Error al enviar el correo de verificación.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: '¡Registro exitoso! Revisa tu correo para confirmar tu subscripción.' }), { status: 200 });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor.' }), { status: 500 });
  }
};
