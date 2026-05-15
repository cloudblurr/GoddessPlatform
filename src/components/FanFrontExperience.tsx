"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Crown,
  Gem,
  Gift,
  Heart,
  Home,
  Lock,
  Megaphone,
  MessageCircle,
  Package,
  Radio,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  User,
  Vote,
  Wallet,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DemoCreator } from "@/lib/demo-mode";

type FanFrontMode = "feed" | "store" | "campaign" | "library" | "wallet" | "profile" | "settings";

type FanFrontExperienceProps = {
  creator: DemoCreator;
  creatorId: string;
  initialMode?: FanFrontMode;
  isCreatorPreview?: boolean;
};

const motionEase = [0.22, 1, 0.36, 1] as const;

const featuredPosts = [
  {
    id: "neon-afterglow",
    type: "New Drop",
    title: "Neon Afterglow: private gallery transmission",
    copy: "A cinematic set with 38 stills, 2 voice notes, and a locked director cut waiting behind the shimmer.",
    image: "/SteamyUI.jpg",
    price: "$18",
    status: "Locked",
    stat: "1.8K unlocked today",
    accent: "#76E4F7",
  },
  {
    id: "ritual-note",
    type: "Announcement",
    title: "Tonight's live room opens at 10",
    copy: "VIPs enter first, top 20 supporters pick the first prompts, and everyone gets a post-show replay.",
    image: "/StarlightUI.jpg",
    price: "Included",
    status: "Open",
    stat: "Live in 4h",
    accent: "#F687B3",
  },
  {
    id: "soft-archive",
    type: "Bundle",
    title: "Soft Archive Volume II",
    copy: "A polished throwback bundle with unlocked previews, discounted extras, and a limited tip goal.",
    image: "/LavendarUI.jpg",
    price: "$34",
    status: "Deal",
    stat: "32% off",
    accent: "#F6E05E",
  },
];

const momentRails = [
  { label: "Bundles", value: "4 active", icon: Package, tone: "#76E4F7" },
  { label: "Deals", value: "32% flash", icon: Gift, tone: "#F6E05E" },
  { label: "Announcements", value: "Live tonight", icon: Megaphone, tone: "#F687B3" },
  { label: "Campaigns", value: "Aurora Week", icon: Radio, tone: "#B794F4" },
  { label: "Polls", value: "2 open", icon: Vote, tone: "#68D391" },
  { label: "Wishlist", value: "$420 goal", icon: Gem, tone: "#FC8181" },
];

const storeItems = [
  {
    title: "Aurora Week All-Access Pass",
    copy: "Every campaign post, locked replay, behind-the-scenes gallery, and VIP comment priority.",
    image: "/GloryUI.jpg",
    price: "$79",
    tag: "Campaign Pass",
    metric: "Best value",
  },
  {
    title: "Custom Voice Note",
    copy: "A personalized 90-second note delivered to your library with optional private prompt.",
    image: "/anna4.jpg",
    price: "$45",
    tag: "Custom",
    metric: "24h delivery",
  },
  {
    title: "Velvet Vault Bundle",
    copy: "Seven premium posts that never had to hit the feed. Unlock, tip, save, and replay anytime.",
    image: "/BossyUI.jpg",
    price: "$29",
    tag: "Bundle",
    metric: "7 items",
  },
  {
    title: "Tip the Studio Goal",
    copy: "Support the next concept shoot and claim a sponsor badge on the leaderboard.",
    image: "/xanamain.jpg",
    price: "$10+",
    tag: "Tip Goal",
    metric: "68% funded",
  },
];

const campaignItems = [
  { title: "Episode 01: Signal", locked: false, kind: "Video", progress: 100 },
  { title: "Gallery: Chrome Bloom", locked: true, kind: "Photo set", progress: 38 },
  { title: "Voice Note: Before the Drop", locked: false, kind: "Audio", progress: 100 },
  { title: "VIP Replay: Afterlight", locked: true, kind: "Replay", progress: 12 },
  { title: "Poll: Choose the Finale", locked: false, kind: "Poll", progress: 100 },
];

const leaderboard = [
  { name: "NovaKing", score: "14.8K", badge: "Crown" },
  { name: "VelvetRay", score: "11.2K", badge: "Streak" },
  { name: "MinaLux", score: "9.9K", badge: "Wishlist" },
  { name: "Afterglow", score: "8.7K", badge: "Tips" },
];

const navItems: Array<{ id: FanFrontMode; label: string; icon: typeof Home }> = [
  { id: "feed", label: "Feed", icon: Home },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

function GlassPanel({
  children,
  p = 5,
}: {
  children: React.ReactNode;
  p?: number | Record<string, number>;
}) {
  return (
    <Box
      p={p}
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg="rgba(7, 10, 22, 0.68)"
      boxShadow="0 24px 80px rgba(0,0,0,0.34)"
      backdropFilter="blur(18px)"
      borderRadius="2xl"
      position="relative"
      overflow="hidden"
    >
      {children}
    </Box>
  );
}

function CreatorAvatar({ creator, size = 72 }: { creator: DemoCreator; size?: number }) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      p="3px"
      bg="linear-gradient(135deg, #76E4F7, #F687B3, #F6E05E)"
      boxShadow="0 0 38px rgba(118,228,247,0.35)"
      flexShrink={0}
    >
      <Box position="relative" w="full" h="full" borderRadius="full" overflow="hidden" bg="black">
        <Image src={creator.avatar} alt={creator.name} fill sizes={`${size}px`} style={{ objectFit: "cover" }} />
      </Box>
    </Box>
  );
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      borderRadius="full"
      px={4}
      minH="42px"
      color={active ? "#07101B" : "whiteAlpha.800"}
      bg={active ? "linear-gradient(135deg, #76E4F7, #F6E05E)" : "whiteAlpha.100"}
      border="1px solid"
      borderColor={active ? "transparent" : "whiteAlpha.200"}
      _hover={{ transform: "translateY(-1px)", bg: active ? undefined : "whiteAlpha.200" }}
      transition="all 180ms ease"
      fontWeight="800"
      fontSize="sm"
    >
      {children}
    </Button>
  );
}

function Hero({ creator, setMode }: { creator: DemoCreator; setMode: (mode: FanFrontMode) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.72, ease: motionEase }}
    >
    <Box
      as="section"
      minH={{ base: "88vh", lg: "76vh" }}
      display="grid"
      gridTemplateColumns={{ base: "1fr", lg: "1.05fr 0.95fr" }}
      alignItems="end"
      gap={8}
      pt={{ base: 8, md: 12 }}
      pb={{ base: 8, md: 10 }}
    >
      <Stack gap={6} zIndex={1}>
        <HStack gap={3} flexWrap="wrap">
          <Badge borderRadius="full" px={3} py={1} bg="whiteAlpha.200" color="cyan.100">
            FanFront live preview
          </Badge>
          <Badge borderRadius="full" px={3} py={1} bg="pink.400/20" color="pink.100">
            {creator.subscriberCount.toLocaleString()} members
          </Badge>
        </HStack>
        <Box>
          <Text color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.22em" fontSize="xs" fontWeight="900">
            Opens into the feed
          </Text>
          <Heading
            as="h1"
            mt={3}
            fontSize={{ base: "4rem", md: "6.5rem", xl: "7.8rem" }}
            lineHeight="0.82"
            letterSpacing="0"
            color="white"
            maxW="760px"
          >
            {creator.name}
          </Heading>
        </Box>
        <Text color="whiteAlpha.800" fontSize={{ base: "md", md: "xl" }} maxW="650px">
          A living social feed with premium unlocks, campaigns, wishlist goals, polls, storefront drops,
          leaderboards, and wallet-aware rewards moving around the fan.
        </Text>
        <HStack gap={3} flexWrap="wrap">
          <Button
            borderRadius="full"
            minH="48px"
            px={6}
            bg="linear-gradient(135deg, #76E4F7, #F6E05E)"
            color="#06101A"
            fontWeight="900"
            onClick={() => setMode("feed")}
            _hover={{ transform: "translateY(-2px)" }}
          >
            <Sparkles size={18} />
            Enter Feed
          </Button>
          <Button
            borderRadius="full"
            minH="48px"
            px={6}
            bg="whiteAlpha.100"
            color="white"
            border="1px solid"
            borderColor="whiteAlpha.300"
            onClick={() => setMode("store")}
            _hover={{ bg: "whiteAlpha.200" }}
          >
            <ShoppingBag size={18} />
            Open Store
          </Button>
        </HStack>
      </Stack>

      <GlassPanel p={3}>
        <Box position="relative" minH={{ base: "440px", md: "560px" }} borderRadius="xl" overflow="hidden">
          <Image src={creator.banner} alt={creator.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
          <Box position="absolute" inset={0} bg="linear-gradient(180deg, transparent 10%, rgba(5,8,18,0.92) 88%)" />
          <VStack position="absolute" left={5} right={5} bottom={5} align="stretch" gap={4}>
            <HStack align="end" justify="space-between">
              <HStack gap={3}>
                <CreatorAvatar creator={creator} />
                <Box>
                  <Text fontSize="sm" color="whiteAlpha.700">{creator.handle}</Text>
                  <Heading size="lg" color="white" letterSpacing="0">{creator.monthlyPrice.toFixed(2)} / mo</Heading>
                </Box>
              </HStack>
              <IconButton aria-label="Follow creator" borderRadius="full" bg="white" color="black">
                <Heart size={18} />
              </IconButton>
            </HStack>
            <SimpleGrid columns={3} gap={2}>
              {["342 posts", "19 drops", "VIP live"].map((item) => (
                <Box key={item} p={3} borderRadius="lg" bg="blackAlpha.500" border="1px solid" borderColor="whiteAlpha.200">
                  <Text fontSize="xs" color="whiteAlpha.700">{item}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Box>
      </GlassPanel>
    </Box>
    </motion.section>
  );
}

function FeedView({ creator, setMode }: { creator: DemoCreator; setMode: (mode: FanFrontMode) => void }) {
  const [selected, setSelected] = useState("All");
  const filters = ["All", "Unlocked", "Locked", "Campaigns", "Polls", "Deals"];

  return (
    <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }} gap={5} alignItems="start">
      <Stack gap={5}>
        <GlassPanel p={{ base: 4, md: 5 }}>
          <Flex align={{ base: "start", md: "center" }} justify="space-between" gap={4} direction={{ base: "column", md: "row" }}>
            <HStack gap={3}>
              <CreatorAvatar creator={creator} size={58} />
              <Box>
                <Text textTransform="uppercase" letterSpacing="0.18em" fontSize="xs" color="cyan.200" fontWeight="900">
                  Live FanFront
                </Text>
                <Heading size="2xl" color="white" letterSpacing="0">{creator.name}</Heading>
              </Box>
            </HStack>
            <HStack gap={2} flexWrap="wrap">
              {filters.map((filter) => (
                <PillButton key={filter} active={selected === filter} onClick={() => setSelected(filter)}>
                  {filter}
                </PillButton>
              ))}
            </HStack>
          </Flex>
        </GlassPanel>

        {featuredPosts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: index * 0.08, ease: motionEase }}
          >
            <GlassPanel p={0}>
              <Grid templateColumns={{ base: "1fr", md: "0.92fr 1.08fr" }} minH={{ base: "auto", md: "380px" }}>
                <Box position="relative" minH={{ base: "320px", md: "100%" }} overflow="hidden">
                  <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                  <Box position="absolute" inset={0} bg={`linear-gradient(135deg, rgba(0,0,0,0.05), ${post.accent}55)`} />
                  <Badge position="absolute" top={4} left={4} borderRadius="full" px={3} py={1} bg="blackAlpha.700" color="white">
                    {post.type}
                  </Badge>
                </Box>
                <Stack p={{ base: 5, md: 7 }} gap={5} justify="space-between">
                  <Stack gap={3}>
                    <HStack justify="space-between" align="start">
                      <Badge borderRadius="full" px={3} py={1} bg={post.status === "Locked" ? "pink.400/20" : "green.400/20"} color="white">
                        {post.status}
                      </Badge>
                      <Text color="whiteAlpha.600" fontSize="sm">{post.stat}</Text>
                    </HStack>
                    <Heading color="white" fontSize={{ base: "2rem", md: "3.5rem" }} lineHeight="0.9" letterSpacing="0">
                      {post.title}
                    </Heading>
                    <Text color="whiteAlpha.700" fontSize="md">{post.copy}</Text>
                  </Stack>
                  <HStack justify="space-between" gap={3} flexWrap="wrap">
                    <HStack gap={2}>
                      <Button borderRadius="full" bg="white" color="black" fontWeight="900">
                        {post.status === "Locked" ? <Lock size={16} /> : <Zap size={16} />}
                        {post.price}
                      </Button>
                      <Button borderRadius="full" bg="whiteAlpha.100" color="white" border="1px solid" borderColor="whiteAlpha.200">
                        <MessageCircle size={16} />
                        Comment
                      </Button>
                    </HStack>
                    <Button variant="plain" color="cyan.100" onClick={() => setMode("campaign")}>
                      View Campaign
                      <ChevronRight size={16} />
                    </Button>
                  </HStack>
                </Stack>
              </Grid>
            </GlassPanel>
          </motion.article>
        ))}
      </Stack>

      <Stack gap={5} position={{ xl: "sticky" }} top={{ xl: 5 }}>
        <GlassPanel>
          <HStack justify="space-between" mb={4}>
            <Heading size="md" color="white" letterSpacing="0">Current Things</Heading>
            <Sparkles size={18} color="#76E4F7" />
          </HStack>
          <SimpleGrid columns={2} gap={3}>
            {momentRails.map((item) => {
              const Icon = item.icon;
              return (
                <Box key={item.label} p={3} borderRadius="xl" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200">
                  <Icon size={18} color={item.tone} />
                  <Text mt={2} color="white" fontWeight="800">{item.label}</Text>
                  <Text color="whiteAlpha.600" fontSize="sm">{item.value}</Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </GlassPanel>

        <GlassPanel>
          <HStack justify="space-between" mb={4}>
            <Heading size="md" color="white" letterSpacing="0">Leaderboard</Heading>
            <Trophy size={18} color="#F6E05E" />
          </HStack>
          <Stack gap={3}>
            {leaderboard.map((fan, index) => (
              <HStack key={fan.name} justify="space-between" p={3} bg="whiteAlpha.100" borderRadius="xl">
                <HStack>
                  <Box w="32px" h="32px" borderRadius="full" display="grid" placeItems="center" bg={index === 0 ? "#F6E05E" : "whiteAlpha.200"} color={index === 0 ? "black" : "white"} fontWeight="900">
                    {index + 1}
                  </Box>
                  <Box>
                    <Text color="white" fontWeight="800">{fan.name}</Text>
                    <Text color="whiteAlpha.600" fontSize="xs">{fan.badge}</Text>
                  </Box>
                </HStack>
                <Text color="cyan.100" fontWeight="900">{fan.score}</Text>
              </HStack>
            ))}
          </Stack>
        </GlassPanel>
      </Stack>
    </Grid>
  );
}

function StoreView() {
  return (
    <Stack gap={5}>
      <GlassPanel>
        <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
          <Box>
            <Text textTransform="uppercase" letterSpacing="0.18em" color="yellow.200" fontSize="xs" fontWeight="900">
              Open shopping layer
            </Text>
            <Heading size="3xl" color="white" letterSpacing="0">Store without posting to feed</Heading>
            <Text mt={2} color="whiteAlpha.700" maxW="760px">
              Products can live here independently: bundles, customs, unlocks, digital goods, campaigns, wishlist goals, and tip-powered rewards.
            </Text>
          </Box>
          <Button borderRadius="full" bg="linear-gradient(135deg, #F6E05E, #F687B3)" color="black" fontWeight="900">
            <WandSparkles size={18} />
            Request Custom
          </Button>
        </Flex>
      </GlassPanel>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={5}>
        {storeItems.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: index * 0.06, ease: motionEase }}
          >
            <GlassPanel p={0}>
              <Box position="relative" minH="280px">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 25vw" style={{ objectFit: "cover" }} />
                <Box position="absolute" inset={0} bg="linear-gradient(180deg, transparent, rgba(4,7,17,0.92))" />
                <Badge position="absolute" top={4} left={4} borderRadius="full" px={3} py={1} bg="blackAlpha.700" color="white">
                  {item.tag}
                </Badge>
              </Box>
              <Stack p={5} gap={4}>
                <Box>
                  <Heading size="lg" color="white" letterSpacing="0">{item.title}</Heading>
                  <Text mt={2} color="whiteAlpha.700" fontSize="sm">{item.copy}</Text>
                </Box>
                <HStack justify="space-between">
                  <Text color="yellow.200" fontSize="2xl" fontWeight="900">{item.price}</Text>
                  <Text color="whiteAlpha.600" fontSize="sm">{item.metric}</Text>
                </HStack>
                <HStack>
                  <Button flex={1} borderRadius="full" bg="white" color="black" fontWeight="900">Unlock</Button>
                  <IconButton aria-label="Tip creator" borderRadius="full" bg="whiteAlpha.100" color="white">
                    <Gift size={18} />
                  </IconButton>
                </HStack>
              </Stack>
            </GlassPanel>
          </motion.article>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function CampaignView({ creator }: { creator: DemoCreator }) {
  return (
    <Grid templateColumns={{ base: "1fr", lg: "0.9fr 1.1fr" }} gap={5}>
      <GlassPanel p={0}>
        <Box position="relative" minH={{ base: "480px", md: "640px" }}>
          <Image src="/GloryUI.jpg" alt="Aurora Week campaign" fill sizes="(max-width: 992px) 100vw, 45vw" style={{ objectFit: "cover" }} />
          <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(5,8,18,0.1), rgba(5,8,18,0.96))" />
          <Stack position="absolute" left={6} right={6} bottom={6} gap={4}>
            <Badge w="fit-content" borderRadius="full" px={3} py={1} bg="cyan.300" color="black">CampaignFront</Badge>
            <Heading color="white" fontSize={{ base: "3rem", md: "5.5rem" }} lineHeight="0.82" letterSpacing="0">
              Aurora Week
            </Heading>
            <Text color="whiteAlpha.800">
              A campaign destination where fans see every related post in one place, whether owned, locked, scheduled, or campaign-pass gated.
            </Text>
            <HStack gap={3} flexWrap="wrap">
              <Button borderRadius="full" bg="white" color="black" fontWeight="900">Unlock Campaign Pass</Button>
              <Button borderRadius="full" bg="whiteAlpha.100" color="white" border="1px solid" borderColor="whiteAlpha.300">Tip the Finale</Button>
            </HStack>
          </Stack>
        </Box>
      </GlassPanel>

      <Stack gap={5}>
        <GlassPanel>
          <HStack gap={3} mb={4}>
            <CreatorAvatar creator={creator} size={48} />
            <Box>
              <Text color="whiteAlpha.600" fontSize="sm">Hosted by {creator.name}</Text>
              <Heading size="lg" color="white" letterSpacing="0">Campaign Content Map</Heading>
            </Box>
          </HStack>
          <Stack gap={3}>
            {campaignItems.map((item) => (
              <Box key={item.title} p={4} borderRadius="xl" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200">
                <HStack justify="space-between" align="start">
                  <Box>
                    <HStack>
                      {item.locked ? <Lock size={16} color="#F687B3" /> : <Star size={16} color="#76E4F7" />}
                      <Text color="white" fontWeight="900">{item.title}</Text>
                    </HStack>
                    <Text color="whiteAlpha.600" fontSize="sm">{item.kind}</Text>
                  </Box>
                  <Badge borderRadius="full" bg={item.locked ? "pink.400/20" : "green.400/20"} color="white">
                    {item.locked ? "Locked" : "Unlocked"}
                  </Badge>
                </HStack>
                <Box mt={3} h="8px" borderRadius="full" bg="whiteAlpha.200" overflow="hidden">
                  <Box h="full" w={`${item.progress}%`} bg={item.locked ? "#F687B3" : "#76E4F7"} />
                </Box>
              </Box>
            ))}
          </Stack>
        </GlassPanel>

        <GlassPanel>
          <Heading size="md" color="white" mb={3} letterSpacing="0">Campaign Extras</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
            {["Group goal", "Limited badge", "Finale poll"].map((item) => (
              <Box key={item} p={4} bg="whiteAlpha.100" borderRadius="xl">
                <Text color="white" fontWeight="900">{item}</Text>
                <Text color="whiteAlpha.600" fontSize="sm">Active now</Text>
              </Box>
            ))}
          </SimpleGrid>
        </GlassPanel>
      </Stack>
    </Grid>
  );
}

function UtilityView({ mode }: { mode: FanFrontMode }) {
  const copy: Record<FanFrontMode, { title: string; text: string; icon: typeof Home }> = {
    feed: { title: "Feed", text: "The main feed is ready.", icon: Home },
    store: { title: "Store", text: "The store is ready.", icon: ShoppingBag },
    campaign: { title: "Campaign", text: "CampaignFront is ready.", icon: Radio },
    library: { title: "My Library", text: "Unlocked posts, campaign passes, custom orders, replays, and saved collections live here.", icon: BookOpen },
    wallet: { title: "Wallet", text: "Fans can manage coins, tips, subscriptions, unlock history, campaign passes, and wishlist contributions.", icon: Wallet },
    profile: { title: "Profile", text: "Fan identity, badges, leaderboard rank, streaks, comments, saved creators, and notification preferences.", icon: User },
    settings: { title: "Settings", text: "Privacy, notifications, payment methods, content filters, and app appearance controls.", icon: Settings },
  };
  const Icon = copy[mode].icon;

  return (
    <GlassPanel>
      <VStack minH="52vh" justify="center" textAlign="center" gap={5}>
        <Box w="72px" h="72px" borderRadius="full" display="grid" placeItems="center" bg="whiteAlpha.100" color="cyan.100">
          <Icon size={30} />
        </Box>
        <Box>
          <Heading color="white" fontSize={{ base: "3rem", md: "5rem" }} letterSpacing="0">{copy[mode].title}</Heading>
          <Text color="whiteAlpha.700" maxW="620px">{copy[mode].text}</Text>
        </Box>
        <HStack gap={3} flexWrap="wrap" justify="center">
          <Button borderRadius="full" bg="white" color="black" fontWeight="900">Open</Button>
          <Button borderRadius="full" bg="whiteAlpha.100" color="white" border="1px solid" borderColor="whiteAlpha.300">Customize</Button>
        </HStack>
      </VStack>
    </GlassPanel>
  );
}

function BottomNav({ mode, setMode }: { mode: FanFrontMode; setMode: (mode: FanFrontMode) => void }) {
  return (
    <Flex
      position="fixed"
      left="50%"
      bottom={{ base: "14px", md: "20px" }}
      transform="translateX(-50%)"
      zIndex={30}
      maxW="min(96vw, 820px)"
      w={{ base: "calc(100vw - 20px)", md: "auto" }}
      p="8px"
      gap="6px"
      borderRadius="full"
      border="1px solid"
      borderColor="whiteAlpha.300"
      bg="rgba(4, 7, 17, 0.82)"
      backdropFilter="blur(18px)"
      boxShadow="0 18px 70px rgba(0,0,0,0.45)"
      overflowX="auto"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = mode === item.id;
        return (
          <Button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            borderRadius="full"
            minW={{ base: "54px", md: "116px" }}
            px={{ base: 3, md: 4 }}
            bg={active ? "white" : "transparent"}
            color={active ? "black" : "whiteAlpha.800"}
            _hover={{ bg: active ? "white" : "whiteAlpha.100" }}
            fontSize="sm"
            fontWeight="900"
          >
            <Icon size={18} />
            <Text display={{ base: "none", md: "inline" }}>{item.label}</Text>
          </Button>
        );
      })}
    </Flex>
  );
}

export default function FanFrontExperience({
  creator,
  creatorId,
  initialMode = "feed",
  isCreatorPreview = false,
}: FanFrontExperienceProps) {
  const [mode, setMode] = useState<FanFrontMode>(initialMode);
  const [entered, setEntered] = useState(initialMode !== "feed" || isCreatorPreview);

  const activeView = useMemo(() => {
    if (mode === "feed") return <FeedView creator={creator} setMode={setMode} />;
    if (mode === "store") return <StoreView />;
    if (mode === "campaign") return <CampaignView creator={creator} />;
    return <UtilityView mode={mode} />;
  }, [creator, mode]);

  return (
    <Box
      minH="100vh"
      bg="#050814"
      color="white"
      position="relative"
      overflow="hidden"
      pb="112px"
      _before={{
        content: '""',
        position: "fixed",
        inset: 0,
        bg: "radial-gradient(circle at 18% 8%, rgba(118,228,247,0.22), transparent 34rem), radial-gradient(circle at 86% 20%, rgba(246,135,179,0.20), transparent 30rem), radial-gradient(circle at 45% 82%, rgba(246,224,94,0.12), transparent 34rem)",
        pointerEvents: "none",
      }}
    >
      <Box position="relative" zIndex={1} maxW="1500px" mx="auto" px={{ base: 4, md: 6, xl: 8 }}>
        <Flex as="header" align="center" justify="space-between" py={5}>
          <HStack gap={3}>
            <Box w="42px" h="42px" borderRadius="full" display="grid" placeItems="center" bg="white" color="black">
              <Crown size={20} />
            </Box>
            <Box>
              <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" fontWeight="900">
                FanFront
              </Text>
              <Text color="white" fontWeight="900">{creator.handle}</Text>
            </Box>
          </HStack>
          <HStack gap={2}>
            {isCreatorPreview ? (
              <Link href={`/demo/${creatorId}/feed`}>
                <Button borderRadius="full" bg="whiteAlpha.100" color="white" border="1px solid" borderColor="whiteAlpha.200">
                  Open Demo
                </Button>
              </Link>
            ) : null}
            <Button borderRadius="full" bg="whiteAlpha.100" color="white" border="1px solid" borderColor="whiteAlpha.200">
              <Bell size={16} />
              <Text display={{ base: "none", md: "inline" }}>Notify</Text>
            </Button>
          </HStack>
        </Flex>

        {!entered ? (
          <Hero creator={creator} setMode={(nextMode) => { setMode(nextMode); setEntered(true); }} />
        ) : (
          <motion.main
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: motionEase }}
          >
            {activeView}
          </motion.main>
        )}
      </Box>
      {entered ? <BottomNav mode={mode} setMode={setMode} /> : null}
    </Box>
  );
}
