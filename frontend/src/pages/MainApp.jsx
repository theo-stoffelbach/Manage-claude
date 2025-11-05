import React from 'react';
import { useAuth } from '../context/AuthContext';
import Terminal from '../components/Terminal';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function MainApp() {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Terminal Claude Code</h1>
          <span className="text-sm text-gray-400">Welcome, {user?.username}</span>
        </div>
        <Button onClick={logout} variant="outline" size="sm">
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-4">
            <Card className="p-4 bg-gray-900">
              <h2 className="text-sm font-semibold text-white mb-2">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  New Session
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Launch Claude
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-gray-900">
              <h2 className="text-sm font-semibold text-white mb-2">Sessions</h2>
              <p className="text-xs text-gray-400">No sessions yet</p>
            </Card>
          </div>
        </div>

        {/* Terminal Area */}
        <div className="flex-1 p-4">
          <Card className="h-full overflow-hidden bg-gray-950 border-gray-700">
            <Terminal />
          </Card>
        </div>
      </div>
    </div>
  );
}
