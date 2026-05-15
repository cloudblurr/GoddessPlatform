import FanFrontExperience from "@/components/FanFrontExperience";
import { DEMO_CREATORS } from "@/lib/demo-mode";
import { requireCreator } from "@/lib/guards";

export default async function FanFrontPage() {
  await requireCreator();

  const previewCreator = DEMO_CREATORS[0];

  return (
    <div className="-m-8">
      <FanFrontExperience
        creator={previewCreator}
        creatorId={previewCreator.id}
        initialMode="feed"
        isCreatorPreview
      />
    </div>
  );
}
