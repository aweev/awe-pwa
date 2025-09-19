// app/api/auth/signup/route.ts
import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';
import { signUpSchema } from '@/lib/auth/auth.schemas';
import { auditLog } from '@/lib/auth/security/audit.logger';
import { getLocaleFromRequest } from '@/lib/utils/request';

export const POST = createApiHandler(
  async (req, { body: credentials }) => {
    const ip = getLocaleFromRequest(req);
    
    const newUser = await authService.register(credentials)
     
    await auditLog("signup_success", newUser.id, { ip, email: newUser.email });
    
    return new Response(
      JSON.stringify({ message: "Registration successful. Please check your email." }),
      { status: 201 }
    );
  },
  {
    limiter: 'global',
    bodySchema: signUpSchema,
  }
);