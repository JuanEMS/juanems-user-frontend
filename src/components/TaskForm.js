import React, { useState, useEffect } from 'react';
   import '../css/styles.css';

   function TaskForm({ addTask, updateTask, editingTask, setEditingTask }) {
     const [title, setTitle] = useState('');
     const [description, setDescription] = useState('');

     useEffect(() => {
       if (editingTask) {
         setTitle(editingTask.title);
         setDescription(editingTask.description || '');
       }
     }, [editingTask]);

     const handleSubmit = (e) => {
       e.preventDefault();
       if (!title.trim()) return;

       const task = { title, description };
       if (editingTask) {
         updateTask(editingTask._id, task);
       } else {
         addTask(task);
       }
       setTitle('');
       setDescription('');
       setEditingTask(null);
     };

     return (
       <form onSubmit={handleSubmit} className="task-form">
         <div className="form-group">
           <label>Title</label>
           <input
             type="text"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             className="form-input"
             required
           />
         </div>
         <div className="form-group">
           <label>Description</label>
           <textarea
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             className="form-textarea"
           />
         </div>
         <button type="submit" className="btn btn-submit">
           {editingTask ? 'Update Task' : 'Add Task'}
         </button>
         {editingTask && (
           <button
             type="button"
             onClick={() => setEditingTask(null)}
             className="btn btn-cancel"
           >
             Cancel
           </button>
         )}
       </form>
     );
   }

   export default TaskForm;