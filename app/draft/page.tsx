import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function DraftRedirect({ searchParams }: Props) {
  const { key } = await searchParams;

  if (key) {
    redirect(`/draft/${key}`);
  }

  redirect('/');
}
