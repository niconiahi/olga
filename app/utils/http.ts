export function error(
  status: number,
  message: string | Record<string, unknown>,
  init?: ResponseInit
) {
  return new Response(
    typeof message === 'string' ? message : JSON.stringify(message),
    {
      ...(init ? init : {}),
      status,
      headers: {
        ...(init?.headers ? init.headers : {}),
        ...(typeof message !== 'string'
          ? { "Content-Type": "application/json" }
          : {}
        ),
      },
    }
  )
}
