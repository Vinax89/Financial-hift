import React from "react";
import useSubscription from "@/subscription/useSubscription";
import Paywall from "@/subscription/Paywall";
import AIAssistantContent from "@/ai/AIAssistantContent";

export default function AIAssistantPage() {
  const { loading, hasFeature } = useSubscription();

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Checking subscriptionâ€¦</div>;
  }

  if (!hasFeature("ai_assistant")) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Paywall
          featureKey="ai_assistant"
          title="AI Assistant is a Pro feature"
          description="Upgrade to Pro to chat with the AI and run advanced agents."
        />
      </div>
    );
  }

  return <AIAssistantContent />;
}
