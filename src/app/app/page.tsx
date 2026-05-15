import FanFrontExperience from "@/components/FanFrontExperience";
import { DEMO_CREATORS } from "@/lib/demo-mode";

export default function SubscriberDashboardPage() {
  const creator = DEMO_CREATORS[0];

  return <FanFrontExperience creator={creator} creatorId={creator.id} initialMode="feed" />;
}
