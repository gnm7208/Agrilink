import { useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, X, Sprout, MapPin, Leaf, Camera } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";

export  function CreatePost() {
  const [images, setImages] = useState([]);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("Advice");

  const addImage = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Create a post</p>
              <p className="text-xs text-gray-500">Share knowledge with the Agrilink community</p>
            </div>
          </div>
          <Button className="rounded-full bg-green-600 px-6 hover:bg-green-700">
            Publish
          </Button>
        </div>

       
        <Card className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <CardContent className="p-0">
           
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-1 bg-gray-100 md:grid-cols-3">
                {images.map((img, i) => (
                  <div key={i} className="group relative aspect-square">
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div className="space-y-4 p-5">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What’s growing on your farm today? 🌱"
                className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm focus:border-green-500 focus:outline-none"
                rows={4}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {["Advice", "Question", "Marketplace", "Success Story"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      tag === t
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600 hover:bg-gray-200">
                    <ImagePlus size={14} />
                    Images
                    <input type="file" multiple hidden onChange={addImage} />
                  </label>
                  <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600 hover:bg-gray-200">
                    <Camera size={14} />
                    Camera
                  </button>
                  <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600 hover:bg-gray-200">
                    <MapPin size={14} />
                    Location
                  </button>
                </div>

                <div className="flex items-center gap-1 text-xs text-green-700">
                  <Leaf size={14} />
                  Agrilink verified content
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspiration strip */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {["Maize tips", "Organic farming", "Market prices", "Irrigation"].map((idea) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={idea}
              className="rounded-xl bg-white p-4 shadow-md"
            >
              <Sprout className="mb-2 text-green-600" size={20} />
              <p className="text-xs font-semibold text-gray-700">{idea}</p>
              <p className="mt-1 text-[11px] text-gray-500">Trending topic</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
