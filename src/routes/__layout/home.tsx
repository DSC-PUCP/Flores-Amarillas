import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { LandingContent } from '@/modules/landing/content';
import { FloatingHearts } from '@/modules/landing/FloatingHearts';

export const Route = createFileRoute('/__layout/home')({
  component: HomeComponent,
});

function HomeComponent() {
  const navigate = useNavigate();
  const [showHearts, setShowHearts] = React.useState(false);

  const handleCreateGift = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowHearts(true);
    navigate({ to: '/template' });
  };

  return (
    <>
      <LandingContent onCreateGift={handleCreateGift} />
      {showHearts && <FloatingHearts />}
    </>
  );
}
