import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddEventPage = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [contentType, setContentType] = useState('book');
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [message, setMessage] = useState('');
  const [contentSearch, setContentSearch] = useState('');

  // New Content Form States
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newSubGenre, setNewSubGenre] = useState('');
  const [newDuration, setNewDuration] = useState(''); // for movies
  const [newTags, setNewTags] = useState(''); // comma separated for simplicity

  useEffect(() => {
    fetchContents(contentType);
    setShowNewForm(false);
    setSelectedContent('');
    setContentSearch('');
  }, [contentType]);

  const fetchContents = async (type) => {
    try {
      const res = await api.get(`/events/content/${type}`);
      setContents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogEvent = async (e) => {
    e.preventDefault();
    try {
      const eventType = contentType === 'book' ? 'completed' : contentType === 'movie' ? 'watched' : 'visited';
      const payload = {
        content_type: contentType,
        content_id: selectedContent,
        event_type: eventType,
        duration: duration ? (contentType === 'book' ? Math.round(parseFloat(duration) * 60) : Math.round(parseFloat(duration))) : null,
        rating: rating ? parseInt(rating) : null,
      };

      await api.post('/events', payload);
      setMessage('Event logged successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error logging event');
    }
  };

  const handleAddNewContent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newTitle,
        name: newTitle, // for travel
        genre: newGenre,
        category: newGenre, // for travel
        sub_genre: newSubGenre,
        sub_category: newSubGenre, // for travel
        popularity: 50,
      };
      if (contentType === 'movie') payload.duration_minutes = parseInt(newDuration);

      let endpoint = '';
      if (contentType === 'book') endpoint = '/books';
      if (contentType === 'movie') endpoint = '/movies';
      if (contentType === 'travel') endpoint = '/travel';

      const res = await api.post(endpoint, payload);
      setMessage('Content added successfully! Now logging your event...');
      
      const newId = contentType === 'travel' ? res.data.destination_id : res.data[`${contentType}_id`];
      
      const eventType = contentType === 'book' ? 'completed' : contentType === 'movie' ? 'watched' : 'visited';
      await api.post('/events', {
        content_type: contentType,
        content_id: newId,
        event_type: eventType,
        duration: duration ? (contentType === 'book' ? Math.round(parseFloat(duration) * 60) : Math.round(parseFloat(duration))) : null,
        rating: rating ? parseInt(rating) : null,
      });

      setMessage('Event logged successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error adding content');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <h1 className="text-5xl font-black uppercase tracking-tighter text-center">Log Activity</h1>

      {message && (
        <div className="neo-border bg-accent p-4 font-bold text-center rounded-lg">{message}</div>
      )}

      <div className="flex justify-center gap-4">
        {['book', 'movie', 'travel'].map(type => (
          <button
            key={type}
            className={`neo-button uppercase text-sm ${contentType === type ? 'bg-black text-white' : 'bg-white text-black'}`}
            onClick={() => setContentType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="neo-card">
        {!showNewForm ? (
          <form onSubmit={handleLogEvent} className="flex flex-col gap-4">
            <div>
              <label className="font-bold text-sm block mb-1">Select {contentType} (Type to search)</label>
              <input 
                className="neo-input" 
                list="contentList" 
                placeholder="Start typing..." 
                value={contentSearch}
                onChange={e => {
                  setContentSearch(e.target.value);
                  const match = contents.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                  if (match) {
                    setSelectedContent(match.id);
                  } else {
                    setSelectedContent('');
                  }
                }}
                required 
              />
              <datalist id="contentList">
                {contents.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
            
            {!selectedContent && contentSearch.length > 0 && (
              <div className="bg-yellow-100 text-yellow-800 p-2 text-sm font-bold rounded-md neo-border">
                "{contentSearch}" not found. Please click "Add new" below to add it.
              </div>
            )}

            <div className="text-right">
              <button type="button" className="text-sm font-bold underline hover:text-accent" onClick={() => { setShowNewForm(true); setNewTitle(contentSearch); }}>
                + Can't find it? Add new
              </button>
            </div>

            {contentType !== 'movie' && (
              <div>
                <label className="font-bold text-sm block mb-1">
                  Duration {contentType === 'travel' ? '(days)' : '(hours, optional)'}
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  className="neo-input" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  required={contentType === 'travel'}
                />
              </div>
            )}

            <div>
              <label className="font-bold text-sm block mb-1">Rating</label>
              <select className="neo-input" value={rating} onChange={e => setRating(e.target.value)}>
                <option value="">-- Select Rating (Optional) --</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Great</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            <button type="submit" className="neo-button mt-4 text-lg bg-accent">Log Event</button>
          </form>
        ) : (
          <form onSubmit={handleAddNewContent} className="flex flex-col gap-4">
            <h2 className="font-black text-xl border-b-2 border-black pb-2">Add New {contentType}</h2>
            <div>
              <label className="font-bold text-sm block mb-1">Name / Title</label>
              <input type="text" className="neo-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
            </div>
            <div>
              <label className="font-bold text-sm block mb-1">Genre / Category</label>
              {contentType === 'book' && (
                <select className="neo-input" value={newGenre} onChange={e => setNewGenre(e.target.value)} required>
                  <option value="">-- Select Genre --</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                </select>
              )}
              {contentType === 'movie' && (
                <select className="neo-input" value={newGenre} onChange={e => setNewGenre(e.target.value)} required>
                  <option value="">-- Select Genre --</option>
                  {['Action','Comedy','Drama','Thriller','Horror','Romance','Sci-Fi','Documentary'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
              {contentType === 'travel' && (
                <select className="neo-input" value={newGenre} onChange={e => setNewGenre(e.target.value)} required>
                  <option value="">-- Select Category --</option>
                  {['Nature','Urban','Cultural','Adventure','Relaxation'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="font-bold text-sm block mb-1">Sub-Genre / Sub-Category</label>
              {contentType === 'book' && (
                <select className="neo-input" value={newSubGenre} onChange={e => setNewSubGenre(e.target.value)} required>
                  <option value="">-- Select Sub-Genre --</option>
                  {['Fantasy','Sci-Fi','Mystery / Thriller','Romance','Horror','Historical Fiction','Biography / Autobiography','Self-help','Business / Finance','Psychology','Technology','Philosophy'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
              {contentType === 'movie' && (
                <select className="neo-input" value={newSubGenre} onChange={e => setNewSubGenre(e.target.value)} required>
                  <option value="">-- Select Sub-Genre --</option>
                  {['Crime','Adventure','Fantasy','Mystery','Psychological','Historical','War','Biography','Family','Animation'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
              {contentType === 'travel' && (
                <select className="neo-input" value={newSubGenre} onChange={e => setNewSubGenre(e.target.value)} required>
                  <option value="">-- Select Sub-Category --</option>
                  {['Mountains','Beaches','Forest / Wildlife','Cities','Historical Sites','Religious Sites','Desert','Islands','Trekking','Nightlife'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
            </div>
            {contentType === 'movie' && (
              <div>
                <label className="font-bold text-sm block mb-1">Duration (minutes)</label>
                <input type="number" className="neo-input" value={newDuration} onChange={e => setNewDuration(e.target.value)} required />
              </div>
            )}
            
            <hr className="border-black border-2 my-2"/>
            <h3 className="font-bold">Log Details</h3>

            {contentType !== 'movie' && (
              <div>
                <label className="font-bold text-sm block mb-1">
                  Duration {contentType === 'travel' ? '(days)' : '(hours, optional)'}
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  className="neo-input" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  required={contentType === 'travel'}
                />
              </div>
            )}

            <div>
              <label className="font-bold text-sm block mb-1">Rating</label>
              <select className="neo-input" value={rating} onChange={e => setRating(e.target.value)}>
                <option value="">-- Select Rating (Optional) --</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Great</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            <div className="flex justify-between mt-4">
              <button type="button" className="neo-button bg-white" onClick={() => setShowNewForm(false)}>Back</button>
              <button type="submit" className="neo-button bg-accent text-lg">Save & Log</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddEventPage;
