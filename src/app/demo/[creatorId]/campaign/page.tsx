import FanFrontExperience from "@/components/FanFrontExperience";
import { getDemoCreator } from "@/lib/demo-mode";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ creatorId: string }>;
};

export default async function DemoCreatorCampaignPage({ params }: PageProps) {
  const { creatorId } = await params;
  const creator = getDemoCreator(creatorId);

  if (!creator) {
    notFound();
  }

  return <FanFrontExperience creator={creator} creatorId={creatorId} initialMode="campaign" />;
}
