// Test script to check task creation
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testCreateTask() {
  try {
    console.log('🧪 Testing task creation...\n');

    // Step 1: Login
    console.log('Step 1: Login with hanh@gmail.com...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'hanh@gmail.com',
      password: '123456'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...\n');

    // Step 2: Create task
    console.log('Step 2: Creating a test task...');
    const taskData = {
      title: 'Test Task - ' + new Date().toISOString(),
      description: 'This is a test task created via API',
      priority: 'medium',
      category: 'Học tập',
      status: 'todo',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    };

    console.log('Task data:', JSON.stringify(taskData, null, 2));

    const createRes = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Task created successfully!');
    console.log('Response:', JSON.stringify(createRes.data, null, 2));

    // Step 3: Verify task exists
    console.log('\nStep 3: Fetching tasks to verify...');
    const tasksRes = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const createdTask = tasksRes.data.data.tasks.find(t => t.id === createRes.data.data.id);
    if (createdTask) {
      console.log('✅ Task verified! Found in task list.');
      console.log('Task:', {
        id: createdTask.id,
        title: createdTask.title,
        status: createdTask.status,
        priority: createdTask.priority
      });
    } else {
      console.log('❌ Task NOT found in list!');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCreateTask();
