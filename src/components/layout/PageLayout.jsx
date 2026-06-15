import { motion } from 'framer-motion'

const variants = {
  initial:  { opacity: 0, y: 8 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:     { opacity: 0, transition: { duration: 0.15 } },
}

export default function PageLayout({ children, header, noScroll = false }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {header}
      {noScroll ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
      ) : (
        <div className="page-scroll" style={{ flex: 1 }}>
          {children}
        </div>
      )}
    </motion.div>
  )
}
