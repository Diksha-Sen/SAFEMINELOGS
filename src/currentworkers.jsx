import React, { useState, useEffect } from 'react';
import { supabase } from './CreateClient';
import './App.css';
import moment from 'moment';

function CurrentWorkers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchWorkersWithNames();
  }, []);
  async function fetchWorkersWithNames() {
    const { data, error } = await supabase
      .from('Curr_Workers')
      .select(`id, timestamp, worker_name:All_workers (worker_name)`)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching workers:', error);
    } else {
      setUsers(data);
    }
  }
  async function deleteUser(userId) {
    await supabase.from('Curr_Workers').delete().eq('id', userId);
    fetchWorkersWithNames();
  }
  function displayTimestamp(timestamp) {
    return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
  }

  return (
    <div className="section-card">
      <header>
        <h2>Current Workers Management</h2>
      </header>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Worker Name</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.worker_name ? user.worker_name.worker_name : 'N/A'}</td>
                <td>{displayTimestamp(user.timestamp)}</td>
                <td>
                  <button type="button" className="btn btn-danger mv" onClick={() => deleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CurrentWorkers;
