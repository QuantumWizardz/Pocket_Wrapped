import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const YearRecapPage = () => {
  const { api } = useAuth();
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [insights, setInsights] = useState(null);
  const [slide, setSlide] = useState(0);
  const [error, setError] = useState('');

  const handleStart = async () => {
    try {
      setError('');
      const res = await api.get(`/insights/${year}`);
      if (res.data.book_count === 0 && res.data.movie_count === 0 && res.data.travel_count === 0) {
        setError("You didn't log any activities this year!");
        return;
      }
      setInsights(res.data);
      setSlide(1);
    } catch (err) {
      setError('Error generating recap.');
    }
  };

  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Your Year Recap</h1>
        <div className="neo-card flex flex-col gap-4 max-w-sm w-full text-center items-center">
          <label className="font-bold">Select Year</label>
          <input 
            type="number" 
            className="neo-input text-center text-2xl font-black w-32" 
            value={year} 
            onChange={e => setYear(e.target.value)} 
          />
          {error && <div className="text-red-500 font-bold">{error}</div>}
          <button onClick={handleStart} className="neo-button bg-accent text-xl mt-4 w-full">Start Journey</button>
        </div>
      </div>
    );
  }

  const slides = [
    null, // Index 0 is prep screen
    (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in zoom-in duration-500">
        <h2 className="text-6xl font-display font-black uppercase tracking-tighter mb-4 text-accent drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">Welcome, {user.username}</h2>
        <p className="text-2xl font-bold bg-white neo-border px-6 py-2 rounded-full">Are you ready to see your {year}?</p>
      </div>
    ),
    (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in slide-in-from-right duration-500">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 bg-white neo-border px-6 py-2 rounded-full">Your vibe this year? Pure {insights.top_category} energy.</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="neo-card bg-accent w-64 h-64 flex flex-col justify-center items-center rotate-[-3deg]">
            <span className="text-7xl font-black">{Math.round((insights.book_minutes + insights.movie_minutes)/60)}</span>
            <span className="font-bold text-xl uppercase mt-2">Hours</span>
            <span className="font-bold text-sm mt-1 border-t-2 border-black pt-1">Reading & Watching</span>
          </div>
          <div className="neo-card bg-white w-64 h-64 flex flex-col justify-center items-center rotate-[3deg]">
            <span className="text-7xl font-black">{insights.travel_days}</span>
            <span className="font-bold text-xl uppercase mt-2">Days</span>
            <span className="font-bold text-sm mt-1 border-t-2 border-black pt-1">Exploring the world</span>
          </div>
        </div>
      </div>
    ),
    ...(insights.book_count > 0 ? [
      (
        <div key="books-1" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in slide-in-from-bottom duration-500">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">You were quite the page-turner.</h2>
          <div className="neo-card bg-white text-black p-8 flex flex-col items-center max-w-lg text-3xl font-bold">
            <p>You lived through <span className="bg-black text-white px-3 py-1 rounded-full">{insights.book_count}</span> stories this year.</p>
          </div>
        </div>
      ),
      (
        <div key="books-2" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in zoom-in duration-500">
          <div className="neo-card bg-accent text-black p-8 flex flex-col items-center max-w-lg text-3xl font-bold">
            <p>That's <span className="text-6xl font-black block my-4">{Math.round(insights.book_minutes/60/24)} Days</span> spent entirely in other worlds.</p>
          </div>
        </div>
      ),
      (
        <div key="books-3" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in slide-in-from-right duration-500">
          <h2 className="text-3xl font-bold mb-6">But there was one world you couldn't get enough of...</h2>
          <div className="neo-card bg-black text-white p-8 flex flex-col items-center max-w-lg text-4xl font-black uppercase">
            <p className="text-accent">{insights.top_book_genre}</p>
          </div>
        </div>
      )
    ] : []),
    ...(insights.movie_count > 0 ? [
      (
        <div key="movies-1" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in slide-in-from-left duration-500">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">You were glued to the screen.</h2>
          <div className="neo-card bg-white text-black p-8 flex flex-col items-center max-w-lg text-3xl font-bold">
            <p>You watched <span className="bg-accent text-black px-3 py-1 rounded-full">{insights.movie_count}</span> movies this year.</p>
          </div>
        </div>
      ),
      (
        <div key="movies-2" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in zoom-in duration-500">
          <h2 className="text-3xl font-bold mb-6">Your cinematic aesthetic?</h2>
          <div className="neo-card bg-black text-white p-8 flex flex-col items-center max-w-lg text-4xl font-black uppercase">
            <p className="text-accent">{insights.top_movie_genre}</p>
            <span className="text-xl lowercase mt-4 text-gray-300">You just couldn't resist.</span>
          </div>
        </div>
      ),
      (
        <div key="movies-3" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold mb-6">And the award for your most-watched movie goes to...</h2>
          <div className="neo-card bg-accent text-black p-8 flex flex-col items-center max-w-lg text-4xl font-black uppercase text-center">
            <p>{insights.top_movie}</p>
          </div>
        </div>
      )
    ] : []),
    ...(insights.travel_count > 0 ? [
      (
        <div key="travel-1" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in slide-in-from-bottom duration-500">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">You didn't just stay put.</h2>
          <div className="neo-card bg-white text-black p-8 flex flex-col items-center max-w-lg text-3xl font-bold">
            <p>You spent <span className="bg-black text-white px-3 py-1 rounded-full">{insights.travel_days}</span> days exploring the world.</p>
          </div>
        </div>
      ),
      (
        <div key="travel-2" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in zoom-in duration-500">
          <h2 className="text-3xl font-bold mb-6">When you traveled, you were drawn to...</h2>
          <div className="neo-card bg-accent text-black p-8 flex flex-col items-center max-w-lg text-4xl font-black uppercase">
            <p>{insights.top_travel_category} places</p>
          </div>
        </div>
      )
    ] : []),
    (
      <div key="outro" className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-700">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-8 bg-accent neo-border px-6 py-2 rounded-full">Your Year in Review</h2>
        <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
          <div className="neo-card flex flex-col items-center">
            <span className="text-4xl mb-2">📚</span>
            <span className="font-black text-2xl">{insights.book_count}</span>
            <span className="font-bold uppercase text-xs">Books</span>
          </div>
          <div className="neo-card flex flex-col items-center">
            <span className="text-4xl mb-2">🎬</span>
            <span className="font-black text-2xl">{insights.movie_count}</span>
            <span className="font-bold uppercase text-xs">Movies</span>
          </div>
          <div className="neo-card flex flex-col items-center">
            <span className="text-4xl mb-2">✈️</span>
            <span className="font-black text-2xl">{insights.travel_count}</span>
            <span className="font-bold uppercase text-xs">Trips</span>
          </div>
        </div>
        <button onClick={() => { setSlide(0); setInsights(null); }} className="neo-button-dark mt-10">Finish Recap</button>
      </div>
    )
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <div className="flex-1 relative">
        {slides[slide]}
      </div>
      
      {/* Navigation & Progress */}
      <div className="h-24 flex items-center justify-between px-8 neo-border border-l-0 border-r-0 border-b-0 bg-white">
        <button 
          onClick={() => setSlide(Math.max(1, slide - 1))} 
          className="neo-button bg-gray-200 disabled:opacity-50"
          disabled={slide === 1}
        >
          Back
        </button>
        
        <div className="flex gap-2">
          {Array(slides.length - 1).fill(0).map((_, i) => (
            <div key={i} className={`h-3 w-3 rounded-full neo-border ${i + 1 === slide ? 'bg-black' : 'bg-white'}`} />
          ))}
        </div>

        <button 
          onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))} 
          className="neo-button bg-accent disabled:opacity-50"
          disabled={slide === slides.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default YearRecapPage;
