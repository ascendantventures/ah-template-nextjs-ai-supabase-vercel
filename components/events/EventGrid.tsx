'use client';

import { motion } from 'framer-motion';
import { TixEvent } from '@/types';
import EventCard from './EventCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface EventGridProps {
  events: TixEvent[];
}

export default function EventGrid({ events }: EventGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24,
      }}
    >
      {events.map(event => (
        <motion.div key={event.event_id} variants={itemVariants}>
          <EventCard event={event} />
        </motion.div>
      ))}
    </motion.div>
  );
}
