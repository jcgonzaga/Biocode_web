
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password');

  if (password === import.meta.env.DASHBOARD_PASSWORD) {
    cookies.set('auth', 'true', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return redirect('/dashboard');
  } else {
    return redirect('/login?error=Contraseña incorrecta');
  }
};
