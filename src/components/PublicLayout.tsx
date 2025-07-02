import React from 'react';
import Layout from './Layout';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <Layout showSidebar={false}>
      {children}
    </Layout>
  );
}