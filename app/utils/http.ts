export function error(
  status: number,
  message: string
) {
  return new Response(message, {
    status
  })
}

export function fail(
  status: number,
  json: Record<string, any>
) {
  return new Response(json as BodyInit, {
    status,
    headers: {
      "Content-Type": "application/json",
    }
  })
}

