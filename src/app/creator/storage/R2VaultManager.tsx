"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileText,
  Folder,
  Gem,
  HardDrive,
  Image as ImageIcon,
  Layers3,
  Link2,
  Loader2,
  Music,
  Pencil,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

type R2File = {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  url: string;
  folder: string;
  isFolder: boolean;
  contentType?: string;
};

type UploadState = {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  key?: string;
  url?: string;
  error?: string;
};

type FilterTab = "all" | "video" | "image" | "audio" | "other";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "image", label: "Images" },
  { id: "audio", label: "Audio" },
  { id: "other", label: "Files" },
];

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileCategory(name: string, contentType?: string): FilterTab {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const mime = contentType ?? "";
  if (mime.startsWith("video") || ["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) return "video";
  if (mime.startsWith("image") || ["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext)) return "image";
  if (mime.startsWith("audio") || ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "audio";
  return "other";
}

function mediaUrlForKey(key: string) {
  return `/api/media/${encodeURIComponent(key)}?mode=redirect`;
}

function FileIcon({ name, contentType, size = 18 }: { name: string; contentType?: string; size?: number }) {
  const cat = fileCategory(name, contentType);
  if (cat === "video") return <Video size={size} color="#B794F4" />;
  if (cat === "image") return <ImageIcon size={size} color="#76E4F7" />;
  if (cat === "audio") return <Music size={size} color="#68D391" />;
  return <FileText size={size} color="rgba(255,255,255,0.62)" />;
}

function GlassPanel({
  children,
  p = 5,
  minH,
}: {
  children: React.ReactNode;
  p?: number | Record<string, number>;
  minH?: string | Record<string, string>;
}) {
  return (
    <Box
      p={p}
      minH={minH}
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg="linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))"
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

export default function R2VaultManager({ configured }: { configured: boolean }) {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [previewFile, setPreviewFile] = useState<R2File | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const loadFiles = useCallback(async (p = prefix) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/r2/files?prefix=${encodeURIComponent(p)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load vault");
      setFiles(data.items ?? []);
      setPrefix(data.prefix ?? p);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Load failed", "err");
    } finally {
      setLoading(false);
    }
  }, [prefix, showToast]);

  useEffect(() => {
    if (!configured) return;
    const timer = window.setTimeout(() => {
      void loadFiles("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [configured]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPreview = (file: R2File) => {
    setPreviewFile(file);
    setRenameValue(file.name);
  };

  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
    setUploads(prev => [{ id, file, progress: 0, status: "pending" }, ...prev]);

    try {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: "uploading", progress: 8 } : u));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round(8 + (event.loaded / event.total) * 88);
            setUploads(prev => prev.map(u => u.id === id ? { ...u, progress: pct } : u));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("POST", "/api/r2/upload");
        xhr.send(formData);
      });

      const result = JSON.parse(xhr.responseText);
      if (!result.key) throw new Error("No key returned from upload");

      setUploads(prev => prev.map(u =>
        u.id === id ? { ...u, status: "done", progress: 100, key: result.key, url: result.url ?? result.mediaUrl } : u
      ));
      showToast(`${file.name} is now in your vault`);
      await loadFiles("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: "error", error: msg } : u));
      showToast(msg, "err");
    }
  }, [loadFiles, showToast]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  }, [uploadFile]);

  const deleteFile = async (file: R2File) => {
    if (!confirm(`Delete "${file.name}" from the vault? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/r2/files/${encodeURIComponent(file.key)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setFiles(prev => prev.filter(item => item.key !== file.key));
      if (previewFile?.key === file.key) setPreviewFile(null);
      showToast(`${file.name} deleted`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "err");
    }
  };

  const renameFile = async () => {
    if (!previewFile || !renameValue.trim() || renameValue.trim() === previewFile.name) return;
    setRenaming(true);
    try {
      const res = await fetch(`/api/r2/files/${encodeURIComponent(previewFile.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rename failed");
      showToast("File renamed");
      await loadFiles(prefix);
      setPreviewFile(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rename failed", "err");
    } finally {
      setRenaming(false);
    }
  };

  const copyUrl = async (file: R2File) => {
    try {
      const res = await fetch(`/api/r2/files/${encodeURIComponent(file.key)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Copy failed");
      await navigator.clipboard.writeText(data.url ?? mediaUrlForKey(file.key));
      showToast("Secure URL copied");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Copy failed", "err");
    }
  };

  const filtered = useMemo(() => {
    return files.filter(file => {
      if (file.isFolder) return true;
      if (filter !== "all" && fileCategory(file.name, file.contentType) !== filter) return false;
      if (query && !file.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [files, filter, query]);

  const fileItems = files.filter(file => !file.isFolder);
  const totalSize = fileItems.reduce((sum, file) => sum + file.size, 0);
  const videoCount = fileItems.filter(file => fileCategory(file.name, file.contentType) === "video").length;
  const imageCount = fileItems.filter(file => fileCategory(file.name, file.contentType) === "image").length;
  const latestFile = fileItems
    .slice()
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];

  if (!configured) {
    return (
      <GlassPanel p={{ base: 5, md: 8 }}>
        <Stack gap={5}>
          <HStack gap={3}>
            <AlertCircle size={26} color="#F6E05E" />
            <Box>
              <Heading size="lg" color="white" letterSpacing="0">R2 Credentials Required</Heading>
              <Text color="whiteAlpha.700">Add your Cloudflare R2 credentials to enable persistent creator storage.</Text>
            </Box>
          </HStack>
          <Box borderRadius="xl" bg="blackAlpha.500" border="1px solid" borderColor="whiteAlpha.200" p={4} fontFamily="mono" fontSize="sm" color="whiteAlpha.800">
            <Text color="whiteAlpha.500"># Add these to your .env file</Text>
            <Text>R2_ACCESS_KEY_ID=your_access_key</Text>
            <Text>R2_SECRET_ACCESS_KEY=your_secret_key</Text>
            <Text>R2_BUCKET_NAME=xanna-media</Text>
            <Text>R2_ENDPOINT=https://&lt;account_id&gt;.r2.cloudflarestorage.com</Text>
          </Box>
        </Stack>
      </GlassPanel>
    );
  }

  return (
    <Box position="relative">
      {toast ? (
        <HStack
          position="fixed"
          right={6}
          bottom={6}
          zIndex={50}
          borderRadius="xl"
          px={4}
          py={3}
          bg={toast.type === "ok" ? "rgba(4, 120, 87, 0.92)" : "rgba(127, 29, 29, 0.92)"}
          border="1px solid"
          borderColor={toast.type === "ok" ? "green.300/40" : "red.300/40"}
          color="white"
          boxShadow="0 20px 60px rgba(0,0,0,0.35)"
        >
          {toast.type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <Text fontSize="sm" fontWeight="700">{toast.msg}</Text>
        </HStack>
      ) : null}

      <Stack gap={6}>
        <Grid templateColumns={{ base: "1fr", xl: "1.08fr 0.92fr" }} gap={6}>
          <GlassPanel minH="360px" p={{ base: 5, md: 7 }}>
            <Box
              position="absolute"
              inset={0}
              bg="radial-gradient(circle at 15% 18%, rgba(201,168,76,0.18), transparent 26rem), radial-gradient(circle at 95% 20%, rgba(118,228,247,0.16), transparent 26rem)"
              pointerEvents="none"
            />
            <Stack gap={6} position="relative">
              <HStack gap={3} flexWrap="wrap">
                <Badge borderRadius="full" px={3} py={1} bg="whiteAlpha.200" color="yellow.100">Cloudflare R2</Badge>
                <Badge borderRadius="full" px={3} py={1} bg="green.400/20" color="green.100">Persistent until deleted</Badge>
              </HStack>
              <Box>
                <Text color="#F6E05E" textTransform="uppercase" letterSpacing="0.22em" fontSize="xs" fontWeight="900">
                  Creator Vault
                </Text>
                <Heading mt={3} color="white" fontSize={{ base: "3.5rem", md: "5.7rem" }} lineHeight="0.82" letterSpacing="0">
                  Your media palace.
                </Heading>
                <Text mt={4} color="whiteAlpha.800" maxW="720px" fontSize={{ base: "md", md: "lg" }}>
                  Upload raw drops, polish store assets, preview locked media, rename files, copy secure links, download masters, and delete only when you decide.
                </Text>
              </Box>
              <SimpleGrid columns={{ base: 1, md: 4 }} gap={3}>
                {[
                  { label: "Files", value: fileItems.length.toLocaleString(), icon: Layers3 },
                  { label: "Stored", value: formatBytes(totalSize), icon: HardDrive },
                  { label: "Video", value: videoCount.toLocaleString(), icon: Video },
                  { label: "Images", value: imageCount.toLocaleString(), icon: ImageIcon },
                ].map(({ label, value, icon: Icon }) => (
                  <Box key={label} p={4} borderRadius="xl" bg="blackAlpha.400" border="1px solid" borderColor="whiteAlpha.200">
                    <Icon size={18} color="#F6E05E" />
                    <Text mt={3} color="white" fontSize="2xl" fontWeight="900">{value}</Text>
                    <Text color="whiteAlpha.600" fontSize="xs" textTransform="uppercase" letterSpacing="0.12em">{label}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Stack>
          </GlassPanel>

          <Box
            borderRadius="2xl"
            border="1px dashed"
            borderColor={dragActive ? "#F6E05E" : "whiteAlpha.300"}
            bg={dragActive ? "rgba(246,224,94,0.12)" : "rgba(255,255,255,0.045)"}
            p={{ base: 5, md: 7 }}
            display="grid"
            placeItems="center"
            minH="360px"
            cursor="pointer"
            transition="all 180ms ease"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleFiles(event.dataTransfer.files);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={event => handleFiles(event.target.files)}
            />
            <VStack gap={5} textAlign="center">
              <Box w="92px" h="92px" borderRadius="full" display="grid" placeItems="center" bg="linear-gradient(135deg, #F6E05E, #F687B3)" color="black" boxShadow="0 0 46px rgba(246,224,94,0.28)">
                <UploadCloud size={38} />
              </Box>
              <Box>
                <Heading size="xl" color="white" letterSpacing="0">Drop content into R2</Heading>
                <Text mt={2} color="whiteAlpha.700">Video, images, audio, product assets, custom deliveries, and campaign files.</Text>
              </Box>
              <Button borderRadius="full" bg="white" color="black" fontWeight="900" px={6}>
                <Sparkles size={18} />
                Select Files
              </Button>
            </VStack>
          </Box>
        </Grid>

        {uploads.length > 0 ? (
          <GlassPanel>
            <Flex align="center" justify="space-between" mb={4}>
              <Heading size="md" color="white" letterSpacing="0">Upload Queue</Heading>
              <Button size="sm" borderRadius="full" bg="whiteAlpha.100" color="white" onClick={() => setUploads(prev => prev.filter(item => item.status === "uploading" || item.status === "pending"))}>
                Clear finished
              </Button>
            </Flex>
            <Stack gap={3}>
              {uploads.map(upload => (
                <Box key={upload.id} borderRadius="xl" bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.200" p={4}>
                  <HStack justify="space-between" gap={4}>
                    <HStack minW={0}>
                      <FileIcon name={upload.file.name} />
                      <Box minW={0}>
                        <Text color="white" fontWeight="800" truncate>{upload.file.name}</Text>
                        <Text color="whiteAlpha.500" fontSize="xs">{formatBytes(upload.file.size)}</Text>
                      </Box>
                    </HStack>
                    <HStack>
                      {upload.status === "uploading" ? <Loader2 size={16} className="animate-spin" color="#F6E05E" /> : null}
                      {upload.status === "done" ? <CheckCircle2 size={16} color="#68D391" /> : null}
                      {upload.status === "error" ? <AlertCircle size={16} color="#FC8181" /> : null}
                      <IconButton aria-label="Remove upload" size="sm" borderRadius="full" bg="whiteAlpha.100" color="white" onClick={() => setUploads(prev => prev.filter(item => item.id !== upload.id))}>
                        <X size={14} />
                      </IconButton>
                    </HStack>
                  </HStack>
                  <Box mt={3} h="7px" borderRadius="full" bg="whiteAlpha.200" overflow="hidden">
                    <Box h="full" w={`${upload.progress}%`} bg={upload.status === "error" ? "#FC8181" : upload.status === "done" ? "#68D391" : "linear-gradient(90deg, #F6E05E, #F687B3)"} />
                  </Box>
                  {upload.error ? <Text mt={2} color="red.200" fontSize="xs">{upload.error}</Text> : null}
                </Box>
              ))}
            </Stack>
          </GlassPanel>
        ) : null}

        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 380px" }} gap={6} alignItems="start">
          <GlassPanel>
            <Flex align={{ base: "start", md: "center" }} justify="space-between" direction={{ base: "column", md: "row" }} gap={4} mb={5}>
              <Box>
                <Heading size="xl" color="white" letterSpacing="0">Uploaded Content</Heading>
                <Text color="whiteAlpha.600">This list is loaded from Cloudflare R2 and remains until a creator deletes it.</Text>
              </Box>
              <HStack gap={2} flexWrap="wrap">
                <Box position="relative">
                  <Search size={16} color="rgba(255,255,255,0.45)" style={{ position: "absolute", left: 14, top: 13, zIndex: 1 }} />
                  <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search vault" pl={10} borderRadius="full" bg="blackAlpha.300" borderColor="whiteAlpha.300" color="white" />
                </Box>
                <IconButton aria-label="Refresh R2 files" borderRadius="full" bg="whiteAlpha.100" color="white" onClick={() => loadFiles(prefix)}>
                  <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                </IconButton>
              </HStack>
            </Flex>

            <HStack gap={2} flexWrap="wrap" mb={5}>
              {TABS.map(tab => (
                <Button
                  key={tab.id}
                  size="sm"
                  borderRadius="full"
                  bg={filter === tab.id ? "white" : "whiteAlpha.100"}
                  color={filter === tab.id ? "black" : "whiteAlpha.800"}
                  onClick={() => setFilter(tab.id)}
                  _hover={{ bg: filter === tab.id ? "white" : "whiteAlpha.200" }}
                >
                  {tab.label}
                </Button>
              ))}
            </HStack>

            {loading ? (
              <HStack py={12} color="whiteAlpha.600">
                <Loader2 size={18} className="animate-spin" />
                <Text>Loading your R2 vault...</Text>
              </HStack>
            ) : filtered.length === 0 ? (
              <VStack py={16} color="whiteAlpha.500">
                <Gem size={40} />
                <Text>No content matches this view yet.</Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {filtered.map(file => (
                  <Box
                    key={file.key}
                    borderRadius="2xl"
                    bg="blackAlpha.300"
                    border="1px solid"
                    borderColor={previewFile?.key === file.key ? "#F6E05E" : "whiteAlpha.200"}
                    overflow="hidden"
                    transition="all 180ms ease"
                    _hover={{ borderColor: "whiteAlpha.400", transform: "translateY(-2px)" }}
                  >
                    <Box position="relative" h="180px" bg="rgba(255,255,255,0.04)" cursor="pointer" onClick={() => file.isFolder ? loadFiles(file.key) : openPreview(file)}>
                      {file.isFolder ? (
                        <VStack h="full" justify="center">
                          <Folder size={42} color="#F6E05E" />
                          <Text color="whiteAlpha.700">Folder</Text>
                        </VStack>
                      ) : fileCategory(file.name, file.contentType) === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrlForKey(file.key)} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <VStack h="full" justify="center">
                          <FileIcon name={file.name} contentType={file.contentType} size={44} />
                          <Badge borderRadius="full" bg="whiteAlpha.200" color="white">{fileCategory(file.name, file.contentType)}</Badge>
                        </VStack>
                      )}
                      {!file.isFolder ? (
                        <Badge position="absolute" top={3} left={3} borderRadius="full" px={3} py={1} bg="blackAlpha.700" color="white">
                          {formatBytes(file.size)}
                        </Badge>
                      ) : null}
                    </Box>
                    <Stack p={4} gap={3}>
                      <Box>
                        <Text color="white" fontWeight="900" truncate>{file.name}</Text>
                        <Text color="whiteAlpha.500" fontSize="xs" truncate>{file.key}</Text>
                      </Box>
                      {!file.isFolder ? (
                        <HStack justify="space-between">
                          <Text color="whiteAlpha.500" fontSize="xs">
                            {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : "R2 object"}
                          </Text>
                          <HStack gap={1}>
                            <IconButton aria-label="Preview file" size="sm" borderRadius="full" bg="whiteAlpha.100" color="white" onClick={() => openPreview(file)}>
                              <Eye size={14} />
                            </IconButton>
                            <IconButton aria-label="Copy secure URL" size="sm" borderRadius="full" bg="whiteAlpha.100" color="white" onClick={() => copyUrl(file)}>
                              <Copy size={14} />
                            </IconButton>
                            <IconButton aria-label="Delete file" size="sm" borderRadius="full" bg="red.400/15" color="red.100" onClick={() => deleteFile(file)}>
                              <Trash2 size={14} />
                            </IconButton>
                          </HStack>
                        </HStack>
                      ) : null}
                    </Stack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </GlassPanel>

          <GlassPanel minH="620px">
            {previewFile ? (
              <Stack gap={5}>
                <Flex justify="space-between" align="start" gap={3}>
                  <Box minW={0}>
                    <Text color="#F6E05E" textTransform="uppercase" letterSpacing="0.18em" fontSize="xs" fontWeight="900">Inspector</Text>
                    <Heading mt={2} color="white" size="lg" letterSpacing="0" truncate>{previewFile.name}</Heading>
                  </Box>
                  <IconButton aria-label="Close preview" borderRadius="full" bg="whiteAlpha.100" color="white" onClick={() => setPreviewFile(null)}>
                    <X size={16} />
                  </IconButton>
                </Flex>

                <Box borderRadius="xl" overflow="hidden" bg="blackAlpha.500" border="1px solid" borderColor="whiteAlpha.200" minH="230px" display="grid" placeItems="center">
                  {fileCategory(previewFile.name, previewFile.contentType) === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrlForKey(previewFile.key)} alt={previewFile.name} style={{ width: "100%", maxHeight: 360, objectFit: "contain" }} />
                  ) : null}
                  {fileCategory(previewFile.name, previewFile.contentType) === "video" ? (
                    <video src={mediaUrlForKey(previewFile.key)} controls preload="metadata" style={{ width: "100%" }} />
                  ) : null}
                  {fileCategory(previewFile.name, previewFile.contentType) === "audio" ? (
                    <Box p={6} w="full"><audio src={mediaUrlForKey(previewFile.key)} controls preload="metadata" style={{ width: "100%" }} /></Box>
                  ) : null}
                  {fileCategory(previewFile.name, previewFile.contentType) === "other" ? (
                    <VStack py={12}>
                      <FileIcon name={previewFile.name} contentType={previewFile.contentType} size={42} />
                      <Text color="whiteAlpha.600">Preview unavailable</Text>
                    </VStack>
                  ) : null}
                </Box>

                <Stack gap={3}>
                  <Text color="whiteAlpha.700" fontSize="sm" fontWeight="800">Rename file</Text>
                  <HStack>
                    <Input value={renameValue} onChange={event => setRenameValue(event.target.value)} borderRadius="full" bg="blackAlpha.300" borderColor="whiteAlpha.300" color="white" />
                    <IconButton aria-label="Rename file" borderRadius="full" bg="white" color="black" loading={renaming} onClick={renameFile}>
                      <Pencil size={16} />
                    </IconButton>
                  </HStack>
                </Stack>

                <SimpleGrid columns={2} gap={3}>
                  <Box p={3} borderRadius="xl" bg="whiteAlpha.100">
                    <Text color="whiteAlpha.500" fontSize="xs">Size</Text>
                    <Text color="white" fontWeight="900">{formatBytes(previewFile.size)}</Text>
                  </Box>
                  <Box p={3} borderRadius="xl" bg="whiteAlpha.100">
                    <Text color="whiteAlpha.500" fontSize="xs">Type</Text>
                    <Text color="white" fontWeight="900" textTransform="capitalize">{fileCategory(previewFile.name, previewFile.contentType)}</Text>
                  </Box>
                  <Box p={3} borderRadius="xl" bg="whiteAlpha.100" gridColumn="1 / -1">
                    <Text color="whiteAlpha.500" fontSize="xs">R2 key</Text>
                    <Text color="yellow.100" fontSize="xs" wordBreak="break-all">{previewFile.key}</Text>
                  </Box>
                </SimpleGrid>

                <Stack gap={2}>
                  <Button borderRadius="full" bg="white" color="black" fontWeight="900" onClick={() => copyUrl(previewFile)}>
                    <Link2 size={16} />
                    Copy Secure URL
                  </Button>
                  <Button asChild borderRadius="full" bg="whiteAlpha.100" color="white" border="1px solid" borderColor="whiteAlpha.200">
                    <a href={mediaUrlForKey(previewFile.key)} target="_blank" rel="noreferrer">
                      <Download size={16} />
                      Download / Open
                    </a>
                  </Button>
                  <Button borderRadius="full" bg="red.400/15" color="red.100" onClick={() => deleteFile(previewFile)}>
                    <Trash2 size={16} />
                    Delete from R2
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <VStack h="full" minH="560px" justify="center" textAlign="center" color="whiteAlpha.650" gap={5}>
                <Box w="76px" h="76px" borderRadius="full" display="grid" placeItems="center" bg="whiteAlpha.100" color="yellow.100">
                  <ShieldCheck size={30} />
                </Box>
                <Box>
                  <Heading size="lg" color="white" letterSpacing="0">Select a vault item</Heading>
                  <Text mt={2}>Preview media, rename objects, copy links, download masters, or remove files from R2.</Text>
                </Box>
                {latestFile ? (
                  <Button borderRadius="full" bg="whiteAlpha.100" color="white" onClick={() => openPreview(latestFile)}>
                    Inspect Latest Upload
                  </Button>
                ) : null}
              </VStack>
            )}
          </GlassPanel>
        </Grid>
      </Stack>
    </Box>
  );
}
