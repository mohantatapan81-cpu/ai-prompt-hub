import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, PlusCircle, Settings, FileText, Trash2, Edit, Copy, Eye, Search, Image as ImageIcon, CheckCircle, BarChart3, TrendingUp, Tags, Youtube, LogIn, Lock, LogOut } from "lucide-react";
import { collection, query, getDocs, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot, orderBy } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db, auth } from "../lib/firebase";

enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write',
}
interface FirestoreErrorInfo {
  error: string; operationType: OperationType; path: string | null; authInfo: any;
}
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: auth.currentUser?.uid, email: auth.currentUser?.email },
    operationType, path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Post {
  id: string;
  title: string;
  promptText: string;
  imageUrl: string;
  videoUrl?: string;
  category: string;
  status: string;
  views: number;
  isTrending: boolean;
  isNew: boolean;
  createdAt: any;
  userId: string;
}

const ADMIN_EMAILS = ["tapankumar9081@gmail.com", "mohantatapan81@gmail.com"]; // Add your admin emails here

export function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'manage'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [domainError, setDomainError] = useState("");

  // Post data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Form state
  const [postId, setPostId] = useState(""); // empty means create new
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState("ai-prompts");
  const [status, setStatus] = useState("published");
  const [isTrending, setIsTrending] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "success" });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetchedPosts);
    }, (error) => {
      if (error.message.includes("index")) {
        console.warn("Index building, doing fallback query");
        getDocs(collection(db, "posts")).then(snap => {
            const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
            fetched.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPosts(fetched);
        }).catch(err => handleFirestoreError(err, OperationType.LIST, "posts"));
      } else {
        handleFirestoreError(error, OperationType.LIST, "posts");
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMsg = error.message || "Login failed.";
      setDomainError("");
      
      if (error?.code === "auth/configuration-not-found" || error?.message?.includes("configuration not found")) {
        errorMsg = "Please manually enable Google Auth in your Firebase Console (Authentication -> Sign-in methods).";
      } else if (error?.code === "auth/unauthorized-domain") {
        errorMsg = `Domain not authorized. Please add this domain to Firebase Auth -> Settings -> Authorized domains.`;
        setDomainError(window.location.hostname);
      } else if (error?.code === "auth/popup-closed-by-user") {
        errorMsg = "Sign in popup was closed. Please try again.";
      }
      
      showMessage(errorMsg, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 4000);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
  };

  const resetForm = () => {
    setPostId("");
    setTitle("");
    setPromptText("");
    setCategory("ai-prompts");
    setStatus("published");
    setIsTrending(false);
    setIsNew(true);
    setImageUrl("");
    setVideoUrl("");
    setImagePreview(null);
  };

  const handleEdit = (post: Post) => {
    resetForm();
    setPostId(post.id);
    setTitle(post.title);
    setPromptText(post.promptText || "");
    setCategory(post.category);
    setStatus(post.status || "published");
    setIsTrending(post.isTrending || false);
    setIsNew(post.isNew || false);
    setImageUrl(post.imageUrl);
    setVideoUrl(post.videoUrl || "");
    setImagePreview(post.imageUrl);
    setActiveTab("create");
    window.scrollTo(0, 0);
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", post.id));
      showMessage("Post deleted successfully");
    } catch (error: any) {
      console.error("Firestore Delete Error", error);
      showMessage(error?.message?.includes("permission") ? "Permission denied. Check Firestore rules." : "Failed to delete post", "error");
    }
  };

  const handlePublishOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      showMessage("You must be logged in.", "error"); return;
    }
    if (!title || !category || !imageUrl) {
      showMessage("Please fill all required fields, including image URL.", "error"); return;
    }

    const currentPostId = postId || doc(collection(db, "posts")).id;
    const existingPost = posts.find(p => p.id === currentPostId);

    const postData: any = {
      title,
      promptText,
      category,
      imageUrl,
      status,
      views: existingPost ? existingPost.views : 0,
      isTrending,
      isNew,
      userId: auth.currentUser.uid,
    };

    if (videoUrl) {
      postData.videoUrl = videoUrl;
    }

    if (!existingPost) {
      postData.createdAt = serverTimestamp();
    } else {
      postData.createdAt = existingPost.createdAt; // keep original
    }

    try {
      await setDoc(doc(db, "posts", currentPostId), postData);
      showMessage(postId ? "Post updated successfully!" : "Post published successfully!");
      if (!postId) resetForm();
      else setActiveTab("manage");
    } catch (error: any) {
      console.error("Firestore Write Error", error);
      showMessage(error?.message?.includes("permission") ? "Permission denied. Check your Firebase Console Firestore rules (allow read, write: if true; for testing)" : "Failed to save post", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage("Copied to clipboard!");
  };

  // Stats calculation
  const totalPosts = posts.length;
  const totalViews = posts.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const categoriesCount = new Set(posts.map(p => p.category)).size;

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || (post.promptText && post.promptText.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  if (authChecking) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-white">Checking auth...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
        <div className="glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full text-center relative overflow-hidden">
          {message.text && (
             <div className="absolute top-0 left-0 w-full bg-red-500/90 text-white text-xs font-bold py-2 px-4 shadow-lg z-10">
               {message.text}
             </div>
          )}
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-white/50" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-4">Admin Access</h1>
          <p className="text-gray-400 mb-8 flex flex-col gap-2 text-sm leading-relaxed">
            <span>Please login with your authorized account to manage content.</span>
          </p>

          {domainError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-left">
              <p className="text-red-400 text-sm font-bold mb-2">Unrecognized Domain! Action Required:</p>
              <p className="text-gray-300 text-xs mb-3">
                Firebase blocked this sign-in request because the current domain is not authorized. Please copy the URL below and add it to your Firebase Console under <strong>Authentication &gt; Settings &gt; Authorized domains</strong>:
              </p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={domainError} 
                  className="w-full bg-black/50 border border-red-500/20 text-red-200 text-xs p-2 rounded-lg focus:outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(domainError)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-colors"
                  title="Copy Domain"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`w-full py-4 rounded-xl text-white font-bold tracking-wide flex justify-center items-center gap-3 transition-all ${
              isLoggingIn 
                ? "bg-white/10 cursor-not-allowed opacity-70" 
                : "bg-gradient-to-r from-neon-purple to-neon-pink shadow-[0_0_20px_rgba(255,42,133,0.3)] hover:shadow-[0_0_30px_rgba(255,42,133,0.6)]"
            }`}
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoggingIn ? "Connecting..." : "Login with Google"}
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
        <div className="glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            You do not have permission to access the admin dashboard with the email:<br/>
            <strong className="text-white mt-2 block">{user.email}</strong>
          </p>
          <button 
            onClick={() => auth.signOut()}
            className="w-full py-4 rounded-xl bg-white/10 text-white font-bold tracking-wide flex justify-center items-center gap-2 hover:bg-white/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="glass-card rounded-2xl p-6 sticky top-24">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold neon-gradient-text mb-1">Hub Admin</h2>
            <p className="text-xs text-gray-400 font-mono flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Firebase Sync Active
            </p>
          </div>

          <nav className="space-y-2 mb-8">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'create', icon: PlusCircle, label: postId ? 'Edit Post' : 'Create Post' },
              { id: 'manage', icon: Settings, label: 'Manage Posts' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'create' && postId) resetForm();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-neon-pink' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-green-500/10 border-green-500/20 text-green-200'}`}
            >
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium text-sm">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-3xl font-display font-bold text-white mb-8">Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 border-t-2 border-t-neon-blue">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-neon-blue" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{totalPosts}</div>
                <div className="text-sm text-gray-400">Total Publications</div>
              </div>

              <div className="glass-card rounded-2xl p-6 border-t-2 border-t-neon-pink">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-neon-pink" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{totalViews}</div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>

              <div className="glass-card rounded-2xl p-6 border-t-2 border-t-neon-purple">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                    <Tags className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-white">Active</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{categoriesCount}</div>
                <div className="text-sm text-gray-400">Categories Used</div>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {posts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-black/50 overflow-hidden" />
                      <div>
                        <h4 className="font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">{post.title}</h4>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{post.category} • {post.views || 0} views</p>
                      </div>
                    </div>
                    <button onClick={() => handleEdit(post)} className="mt-4 sm:mt-0 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
                      Edit
                    </button>
                  </div>
                ))}
                {posts.length === 0 && <p className="text-gray-400 text-sm">No activity yet. Create a post to see it here.</p>}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card rounded-3xl p-6 sm:p-10 relative">
              <h1 className="text-3xl font-display font-bold text-white mb-8">
                {postId ? "Edit Publication" : "Create New Publication"}
              </h1>

              <form onSubmit={handlePublishOrUpdate} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Col: Details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Post Title *</label>
                      <input 
                        type="text" required value={title} onChange={e => setTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-all placeholder:text-gray-600"
                        placeholder="e.g. Cinematic Street Photography"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category *</label>
                        <select 
                          value={category} onChange={e => setCategory(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors appearance-none"
                        >
                          <option value="ai-prompts">AI Prompts</option>
                          <option value="presets">Lightroom Presets</option>
                          <option value="reels">Reels Templates</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Visibility Status</label>
                        <select 
                          value={status} onChange={e => setStatus(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors appearance-none"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex justify-between">
                        <span>Content / Prompt Text</span>
                        <span className="text-neon-pink normal-case text-[10px]">Markdown Supported</span>
                      </label>
                      <textarea 
                        rows={6} value={promptText} onChange={e => setPromptText(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors resize-y placeholder:text-gray-600"
                        placeholder="Enter the prompt, copy, or details here..."
                      ></textarea>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Image URL *</label>
                      <input 
                        type="url" required value={imageUrl} onChange={handleImageUrlChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-all placeholder:text-gray-600"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex justify-between">
                        <span>YouTube Video URL (Optional)</span>
                        <span className="text-neon-blue normal-case text-[10px]">For Trailers/Tutorials</span>
                      </label>
                      <div className="relative">
                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                          type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-all placeholder:text-gray-600"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Media & Badges */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Thumbnail Preview</label>
                      
                      <div className="relative group rounded-2xl overflow-hidden bg-black/60 border border-white/10 aspect-square flex flex-col items-center justify-center transition-all">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                        ) : (
                          <div className="text-center p-6 text-gray-500">
                            <ImageIcon className="w-10 h-10 mb-2 mx-auto opacity-50" />
                            <p className="text-xs">No image provided</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="glass-card rounded-xl p-5 space-y-4 border border-white/5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-3">Badges & Attributes</label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ease-in-out ${isTrending ? 'bg-neon-pink' : 'bg-gray-700'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isTrending ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Trending Badge</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ease-in-out ${isNew ? 'bg-neon-blue' : 'bg-gray-700'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isNew ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">New Badge</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(255,42,133,0.3)] hover:shadow-[0_0_30px_rgba(255,42,133,0.6)] transition-all"
                  >
                    {postId ? "Update Publication" : "Publish Content"}
                  </button>
                  {postId && (
                    <button 
                      type="button" onClick={resetForm}
                      className="px-8 py-4 rounded-xl bg-white/10 text-white font-bold tracking-wide uppercase hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'manage' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-display font-bold text-white">Manage Posts</h1>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" placeholder="Search titles or prompts..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-neon-purple transition-colors"
                  />
                </div>
                <select 
                  value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-purple transition-colors appearance-none"
                >
                  <option value="all">All Categories</option>
                  <option value="ai-prompts">AI Prompts</option>
                  <option value="presets">Presets</option>
                  <option value="reels">Reels</option>
                </select>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
               {filteredPosts.length === 0 ? (
                 <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                   <FileText className="w-12 h-12 mb-4 opacity-20" />
                   <p>No posts found matching your criteria.</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-white/10 bg-black/40">
                         <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Media</th>
                         <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Details</th>
                         <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                         <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Stats</th>
                         <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {filteredPosts.map(post => (
                         <tr key={post.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-4">
                             <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/50 border border-white/10 relative">
                               <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                               {post.videoUrl && <Youtube className="absolute bottom-1 right-1 w-4 h-4 text-red-500 drop-shadow-md" />}
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="font-bold text-white mb-1">{post.title}</div>
                             <div className="text-xs text-gray-400 uppercase tracking-widest">{post.category}</div>
                           </td>
                           <td className="p-4">
                             <div className="flex flex-col gap-2">
                               <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider w-fit ${post.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                 {post.status}
                               </span>
                               {(post.isTrending || post.isNew) && (
                                 <div className="flex gap-1">
                                   {post.isTrending && <span className="w-2 h-2 rounded-full bg-neon-pink" title="Trending"></span>}
                                   {post.isNew && <span className="w-2 h-2 rounded-full bg-neon-blue" title="New"></span>}
                                 </div>
                               )}
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="flex items-center gap-2 text-sm text-gray-300">
                               <Eye className="w-4 h-4 text-gray-500" />
                               {post.views || 0}
                             </div>
                           </td>
                           <td className="p-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                               {post.promptText && (
                                 <button onClick={() => copyToClipboard(post.promptText)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Copy Prompt">
                                   <Copy className="w-4 h-4" />
                                 </button>
                               )}
                               <button onClick={() => handleEdit(post)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Edit Post">
                                 <Edit className="w-4 h-4" />
                               </button>
                               <button onClick={() => handleDelete(post)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete Post">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
