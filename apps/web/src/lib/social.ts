export type SocialLink = {
  id: 'facebook' | 'instagram' | 'twitter' | 'tiktok';
  href: string;
  label: string;
};

function whatsappHref(number: string | undefined): string | null {
  if (!number?.trim()) {
    return null;
  }

  const digits = number.replace(/\D/g, '');
  if (!digits) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

/** Social links configured via public env vars — only defined entries are shown. */
export function getSocialLinks(
  labels: Record<SocialLink['id'], string>,
): SocialLink[] {
  const candidates: Array<{
    id: SocialLink['id'];
    href: string | null;
    label: string;
  }> = [
    {
      id: 'facebook',
      href: 'https://www.facebook.com/hussien.kamal.elden/',
      label: labels.facebook,
    },
    {
      id: 'instagram',
      href: 'https://www.facebook.com/hussien.kamal.elden/',
      label: labels.instagram,
    },
    {
      id: 'twitter',
      href: 'https://www.facebook.com/hussien.kamal.elden/',
      label: labels.twitter,
    },
    {
      id: 'tiktok',
      href: 'https://www.facebook.com/hussien.kamal.elden/',
      label: labels.tiktok,
    },
  ];

  return candidates.filter((item): item is SocialLink => item.href !== null);
}
