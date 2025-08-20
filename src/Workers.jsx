import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './CreateClient';
import './App.css';

function Workers() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({
    worker_name: '',
    phone_number: '',
    email: ''
  });

  const [user2, setUser2] = useState({
    id: '',
    worker_name: '',
    phone_number: '',
    email: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get the current day of the week (e.g., Mon, Tue, etc.)
  const getCurrentDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    return days[today.getDay()];
  };

  async function fetchUsers() {
    const currentDay = getCurrentDay();

    // First, fetch workers from All_workers
    const { data: workers } = await supabase
      .from('All_workers')
      .select('*')
      .order('id', { ascending: true });

    // Then, fetch all shift data from Worker_shift
    const { data: workerShifts } = await supabase
      .from('Worker_shift')
      .select('*');

    // Create a map of shifts based on id from Worker_shift for faster lookup
    const shiftMap = workerShifts.reduce((map, shift) => {
      map[shift.id] = shift;
      return map;
    }, {});

    // Map each user to a shift based on fetched Worker_shift
    const usersWithShift = workers.map((user) => {
      const shiftData = shiftMap[user.id]; // Find the shift by worker's ID
      const shiftForToday = shiftData ? shiftData[currentDay] : ''; // If no shift data, leave it blank

      return { ...user, shift: shiftForToday };
    });

    setUsers(usersWithShift);
  }

  function handleChange(event) {
    setUser(prevFormData => {
      return {
        ...prevFormData,
        [event.target.name]: event.target.value
      };
    });
  }

  function handleChange2(event) {
    setUser2(prevFormData => {
      return {
        ...prevFormData,
        [event.target.name]: event.target.value
      };
    });
  }

  async function createUser(event) {
    event.preventDefault();
    try {
      const { data: maxIdData, error: maxIdError } = await supabase
              .from('All_workers')
              .select('id')
              .order('id', { ascending: false })
              .limit(1);
      
            if (maxIdError) {
              console.error("Error fetching max ID:", maxIdError);
              alert("Error fetching max ID: " + maxIdError.message);
              return;
            }
      
            let newId;
            if (maxIdData && maxIdData.length > 0) {
              // If there are existing records, increment the max ID
              newId = maxIdData[0].id + 1;
            } else {
              // If no records exist, start from 1
              newId = 1;
            }
      
            // 2. Insert the new supervisor with the calculated ID
            const { data, error } = await supabase.from('All_workers').insert({
              id: newId, // Explicitly provide the calculated ID
              worker_name: user.worker_name,
              phone_number: user.phone_number,
              email: user.email
            });
      
            if (error) {
              // Handle potential duplicate key error if two users try to insert with the same ID
              if (error.code === '23505') { // PostgreSQL unique violation error code
                alert("A worker with this ID already exists or a concurrent operation occurred. Please try again.");
                console.warn("Duplicate ID detected, attempting to re-fetch and re-insert or notify user.");
                // You might want to re-call fetchUsers and let the user try again
                // or implement a retry mechanism.
              } else {
                console.error("Error creating user:", error);
                alert("Error creating user: " + error.message);
              }
              return;
            }
      
            console.log("User created successfully:", data);
            fetchUsers(); // Refresh the list of users
            // Optionally clear the form after successful submission
            setUser({
              worker_name: '',
              phone_number: '',
              email: ''
            });
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteUser(userId) {
    await supabase.from('All_workers').delete().eq('id', userId);
    fetchUsers();
  }

  function displayUser(userId) {
    users.map((user) => {
      if (user.id === userId) {
        setUser2({ id: user.id, worker_name: user.worker_name, phone_number: user.phone_number, email: user.email });
      }
    });
  }

  const updateUser = useCallback(async (userId) => {
    const { data, error } = await supabase.from('All_workers')
      .update({ worker_name: user2.worker_name, phone_number: user2.phone_number, email: user2.email })
      .eq('id', userId);

    fetchUsers();

    if (data) {
      console.log(data);
    }
    if (error) {
      console.log(error);
    }
  }, [user2]);

  // Shift allotment function that distributes shifts in round-robin fashion across workers
  async function shiftAllotment() {
    let shifts = ["A", "B", "C"];

    // Fetch existing worker shifts
    const { data: workerShifts } = await supabase.from('Worker_shift').select('*');
    const shiftMap = workerShifts.reduce((map, shift) => {
      map[shift.id] = shift;
      return map;
    }, {});

    // Track the last shift index to maintain round-robin assignment
    let lastShiftIndex = -1;

    // Iterate through the users and update their shift
    for (let user of users) {
      lastShiftIndex = (lastShiftIndex + 1) % shifts.length; // Cycle through shifts A, B, C
      const newShift = shifts[lastShiftIndex];

      // Check if the worker already has a shift
      if (shiftMap[user.id]) {
        // Update the shift for the worker in Worker_shift table
        await supabase
          .from('Worker_shift')
          .update({
            Mon: newShift,
            Tue: newShift,
            Wed: newShift,
            Thu: newShift,
            Fri: newShift,
            Sat: newShift,
          })
          .eq('id', user.id);
      } else {
        // Insert a new shift entry if the worker does not have one
        await supabase.from('Worker_shift').insert({
          id: user.id,
          Mon: newShift,
          Tue: newShift,
          Wed: newShift,
          Thu: newShift,
          Fri: newShift,
          Sat: newShift,
        });
      }
    }

    // Re-fetch users to update the UI with the new shifts
    fetchUsers();
  }

  return (
    <div className="split-layout no-gap">
      <div className="table-col table-col-75">
        <div className="table-card">
          {/* <header className="table-header">
            <h2>Workers Management</h2>
          </header> */}
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Worker Name</th>
                  <th>Phone No</th>
                  <th>Email Id</th>
                  <th>Shift</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.worker_name}</td>
                    <td>{user.phone_number}</td>
                    <td>{user.email}</td>
                    <td>{user.shift || 'No Shift'}</td>
                    <td>
                      <button type="button" className="btn btn-primary mv" onClick={() => {
                        setUser2({ id: '', worker_name: '', phone_number: '', email: '' });
                        displayUser(user.id);
                      }}>Edit</button>
                      <button type="button" className="btn btn-danger mv" onClick={() => { deleteUser(user.id); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="shift-allotment-btn-row">
              <button className="shift-allotment-btn" onClick={shiftAllotment}>Shift Allotment</button>
            </div>
        
      </div>
      <div className="form-col form-col-25 full-height">
        <div className="form-block">
          <h5>Add New Worker</h5>
          <form onSubmit={createUser} className="vertical-form">
            <label> Worker Name
              <input type='text' placeholder='Worker Name' name='worker_name' onChange={handleChange} value={user.worker_name} />
            </label>
            <label> Phone Number
              <input type='number' placeholder='Phone Number' name='phone_number' onChange={handleChange} value={user.phone_number} />
            </label>
            <label> Email
              <input type='email' placeholder='Email' name='email' onChange={handleChange} value={user.email} />
            </label>
            <button type='submit' className="btn btn-success add">Create</button>
          </form>
        </div>
        <div className="form-block">
          <h5>Update Worker</h5>
          <form onSubmit={(e) => {
            e.preventDefault();
            updateUser(user2.id);
          }} className="vertical-form">
            <label>Worker Name
              <input type='text' placeholder='Worker Name' name='worker_name' onChange={handleChange2} value={user2.worker_name} />
            </label>
            <label>Phone Number
              <input type='text' placeholder='Phone Number' name='phone_number' onChange={handleChange2} value={user2.phone_number} />
            </label>
            <label>Email
              <input type='text' placeholder='Email' name='email' onChange={handleChange2} value={user2.email} />
            </label>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Workers;
