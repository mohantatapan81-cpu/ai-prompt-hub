import { motion, AnimatePresence } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Camera, Film, X, Copy, CheckCircle, Eye, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Post } from "./Admin";

enum OperationType { CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write' }
interface FirestoreErrorInfo { error: string; operationType: OperationType; path: string | null; authInfo: any; }
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: auth.currentUser?.uid, email: auth.currentUser?.email },
    operationType, path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Convert youtube url to embed url
const getYoutubeEmbedUrl = (url: string) => {
  try {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      videoId = new URLSearchParams(new URL(url).search).get("v") || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (e) {
    return null;
  }
};

export function Category() {
  const { id } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [copied, setCopied] = useState(false);

  let details = {
    title: "Category", icon: Sparkles, color: "from-gray-500 to-gray-700", gradientText: "from-gray-300 to-white",
  };

  if (id === "ai-prompts") {
    details = { title: "AI Prompts", icon: Sparkles, color: "from-[#ff2a85] to-[#ff758c]", gradientText: "from-[#ff2a85] to-neon-purple", };
  } else if (id === "presets") {
    details = { title: "Lightroom Presets", icon: Camera, color: "from-[#8a2be2] to-[#b82eff]", gradientText: "from-neon-purple to-neon-blue", };
  } else if (id === "reels") {
    details = { title: "Reels Templates", icon: Film, color: "from-[#00e5ff] to-[#009dff]", gradientText: "from-neon-blue to-[#00ff88]", };
  }

  const Icon = details.icon;

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const q = query(
      collection(db, "posts"), 
      where("category", "==", id),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetched);
      setLoading(false);
      setErrorText("");
    }, (error: any) => {
      if (error.message && error.message.includes("index")) {
        // Fallback for missing index
        const q2 = query(collection(db, "posts"), where("category", "==", id), where("status", "==", "published"));
        getDocs(q2).then(snap => {
          const fetched2 = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
          fetched2.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setPosts(fetched2);
          setLoading(false);
          setErrorText("");
        }).catch(err => {
          setLoading(false);
          setErrorText(err.message?.includes("permission") ? "Permission denied. Please check your Firestore rules." : "Failed to load posts.");
        });
      } else {
        setLoading(false);
        setErrorText(error.message?.includes("permission") ? "Permission denied. Please check your Firestore rules." : "Failed to load posts.");
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handlePostClick = async (post: Post) => {
    setSelectedPost(post);
    try {
      const docRef = doc(db, "posts", post.id);
      const postFromDb = await getDoc(docRef);
      if (postFromDb.exists()) {
        const currentViews = postFromDb.data().views || 0;
        await updateDoc(docRef, { views: currentViews + 1 });
      }
    } catch (e) {
      console.warn("Could not increment views", e);
    }
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-28 px-4 md:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-gray-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-6 mb-16">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br ${details.color} shadow-lg shadow-black/50`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight">
             <span className={`bg-gradient-to-r ${details.gradientText} text-transparent bg-clip-text`}>
               {details.title}
             </span>
          </h1>
        </motion.div>

        {loading ? (
           <div className="flex justify-center items-center py-20 text-white">Loading...</div>
        ) : errorText ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400 bg-red-500/10 rounded-3xl border border-red-500/20 px-6 text-center">
            <span className="font-bold text-xl mb-2">Error Connecting to Database</span>
            <p className="text-red-300">{errorText}</p>
            <p className="text-gray-400 mt-4 text-sm max-w-md">Make sure your Firebase project ({id}) has Firestore enabled and rules are configured properly.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Icon className="w-16 h-16 mb-4 opacity-50" />
            <p>No content available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => handlePostClick(post)}
                className="aspect-[4/5] glass-card rounded-2xl p-4 flex flex-col justify-end group overflow-hidden relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${post.imageUrl})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {post.isTrending && (
                    <div className="px-3 py-1 bg-neon-pink/80 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-lg">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">Trending</span>
                    </div>
                  )}
                  {post.isNew && (
                    <div className="px-3 py-1 bg-neon-blue/80 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-lg w-fit">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">New</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {post.videoUrl && (
                    <span className="px-2 py-1 bg-red-600/80 backdrop-blur-md rounded-full shadow-lg">
                      <Youtube className="w-3 h-3 text-white" />
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full">
                    <Eye className="w-3 h-3 text-gray-300" />
                    <span className="text-[10px] font-bold text-gray-300">{post.views || 0}</span>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h4 className="font-display font-semibold text-lg text-white mb-1 group-hover:text-neon-blue transition-colors">{post.title}</h4>
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors">View Details &rarr;</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedPost && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto pt-20 pb-20"
              onClick={() => setSelectedPost(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_50px_rgba(0,0,0,0.8)] my-auto"
              >
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-full md:w-1/2 flex flex-col border-r border-white/5 bg-black/40">
                  {selectedPost.videoUrl && getYoutubeEmbedUrl(selectedPost.videoUrl) ? (
                    <div className="w-full aspect-square md:aspect-auto h-full flex flex-col items-center justify-center bg-black">
                      <iframe 
                        src={getYoutubeEmbedUrl(selectedPost.videoUrl) || ""}
                        title={selectedPost.title}
                        className="w-full aspect-video border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full aspect-square md:aspect-auto h-full">
                       <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col h-full bg-gradient-to-br from-[#0a0a0f] to-[#12121a]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mb-4">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs uppercase tracking-wider text-gray-400">{details.title}</span>
                  </div>

                  <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-6 pr-8 leading-tight">{selectedPost.title}</h2>
                  
                  {selectedPost.promptText && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative group mb-8 shadow-inner flex-1 max-h-[300px] flex flex-col">
                      <div className="absolute -top-3 left-6 px-2 bg-[#0a0a0f] text-xs font-semibold uppercase tracking-wider text-neon-pink">
                        Details / Prompt
                      </div>
                      <div className="overflow-y-auto flex-1 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed mt-2 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {selectedPost.promptText}
                      </div>
                      <button 
                        onClick={() => copyPrompt(selectedPost.promptText)}
                        className="absolute right-4 top-4 p-2 rounded-lg bg-black/40 hover:bg-black/60 text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  
                  <button className="mt-auto py-4 rounded-xl font-bold tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] bg-white text-black hover:bg-gray-200 w-full text-center">
                    Get Access
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
