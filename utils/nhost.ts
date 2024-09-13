
import { NhostClient } from "@nhost/nextjs";

export const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_SUBDOMAIN,
  region: process.env.NEXT_PUBLIC_RIGION,
})




