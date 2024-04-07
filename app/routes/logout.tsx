import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { getAuth, validateSession } from "~/utils/auth";

export async function action({
  request, context
}: ActionFunctionArgs) {
  const auth = getAuth(context)
  const { session } = await validateSession(request, context)
  await auth.invalidateSession(session?.id ?? "")
  return { ok: true }
}
