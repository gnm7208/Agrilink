import React from 'react'
/* eslint-disable-next-line no-unused-vars -- motion is used as motion.div in JSX */
import { motion } from 'framer-motion'

const ChatBubble = ({ message, time, isSent }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      className={`flex w-full mb-4 ${
        isSent ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isSent
            ? 'bg-green-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-slate-800 text-gray-800 rounded-tl-none border border-gray-100 dark:border-slate-700'
        }`}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            isSent ? 'text-green-100' : 'text-gray-400'
          }`}
        >
          {time}
        </p>
      </div>
    </motion.div>
  )
}

export default ChatBubble