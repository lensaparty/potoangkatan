import { RegisterClient } from "./register-client";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  return <RegisterClient eventSlug={eventSlug} />;
}

