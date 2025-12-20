/**
 * App Routes - Main routing component
 * Uses Index.tsx as main entry which handles internal routing
 */
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyPages } from './routes.config';
import { LoadingFallback } from './LoadingFallback';

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Main app - Index handles most internal routing */}
        <Route path="/" element={<LazyPages.Index />} />
        <Route path="/chat" element={<LazyPages.Chat />} />
        
        {/* Auth - standalone pages */}
        <Route path="/login" element={<LazyPages.Login />} />
        <Route path="/signup" element={<LazyPages.Signup />} />
        <Route path="/forgot-password" element={<LazyPages.ForgotPassword />} />
        
        {/* DevOps routes */}
        <Route path="/devops/pipelines" element={<LazyPages.CICDPipelines />} />
        <Route path="/devops/code-review" element={<LazyPages.CodeReview />} />
        <Route path="/devops/deployment" element={<LazyPages.Deployment />} />
        <Route path="/devops/infrastructure" element={<LazyPages.Infrastructure />} />
        <Route path="/devops/security" element={<LazyPages.SecurityScanning />} />
        <Route path="/devops/logs" element={<LazyPages.LogAnalysis />} />
        
        {/* Legal routes */}
        <Route path="/legal/contracts" element={<LazyPages.Contracts />} />
        <Route path="/legal/document-review" element={<LazyPages.DocumentReview />} />
        <Route path="/legal/compliance" element={<LazyPages.Compliance />} />
        <Route path="/legal/nda-generator" element={<LazyPages.NDAGenerator />} />
        <Route path="/legal/ip-management" element={<LazyPages.IPManagement />} />
        <Route path="/legal/case-research" element={<LazyPages.CaseResearch />} />
        
        {/* Monitoring routes */}
        <Route path="/monitoring/activity" element={<LazyPages.ActivityStream />} />
        <Route path="/monitoring/alerts" element={<LazyPages.AlertsControls />} />
        <Route path="/monitoring/execution" element={<LazyPages.ExecutionTrace />} />
        <Route path="/monitoring/tools" element={<LazyPages.ToolMonitor />} />
        
        {/* 404 */}
        <Route path="*" element={<LazyPages.NotFound />} />
      </Routes>
    </Suspense>
  );
}
