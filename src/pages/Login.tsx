import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (name.trim()) {
      // Check if already onboarded before
      const onboarded = localStorage.getItem("planos-onboarded");
      if (onboarded) {
        localStorage.setItem("planos-user", JSON.stringify({ name: name.trim(), loggedIn: true }));
        navigate("/");
      } else {
        // Go to onboarding wizard instead of directly logging in
        navigate("/onboarding", { state: { name: name.trim() } });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
        >
          <BookOpen className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Plan OS</h1>
          <p className="text-muted-foreground text-sm">Your intelligent study operating system</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">What's your name?</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="h-12 text-base bg-card border-border"
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              autoFocus
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base gap-2 disabled:opacity-40"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Features hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Works fully offline • No account needed</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
