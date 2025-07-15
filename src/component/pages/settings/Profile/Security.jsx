import React from 'react';
import { motion } from 'framer-motion';

const SecurityLogs = () => {
  const logs = [
    { id: 1, action: 'Login', device: 'Chrome on Windows', location: 'New York, NY', time: '2 hours ago', status: 'Success' },
    { id: 2, action: 'Password Change', device: 'Safari on iPhone', location: 'San Francisco, CA', time: '1 day ago', status: 'Success' },
    { id: 3, action: 'Login Attempt', device: 'Firefox on Linux', location: 'London, UK', time: '3 days ago', status: 'Failed' },
    { id: 4, action: 'Two-factor Enabled', device: 'Chrome on Mac', location: 'Chicago, IL', time: '1 week ago', status: 'Success' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Security Logs</h2>
        <p className="text-gray-600 mb-4">Recent security activities on your account</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.device}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SecurityLogs;