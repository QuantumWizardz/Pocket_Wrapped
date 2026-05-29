import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RecommendationsPage = () => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('books');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [activeTab]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/recommendations/${activeTab}?top_n=10`);
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-5xl font-black uppercase tracking-tighter text-center mb-4">Your Picks</h1>

      <div className="flex justify-center gap-4">
        {['books', 'movies', 'travel'].map(tab => (
          <button
            key={tab}
            className={`neo-button uppercase text-sm ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-black'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center font-bold text-xl mt-10">Scoring content...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.length > 0 ? recommendations.map((item, i) => (
            <div key={i} className="neo-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-xl uppercase leading-tight pr-4">
                    {item.title || item.name}
                  </h3>
                  <div className="bg-accent neo-border px-2 py-1 rounded-full text-xs font-black shrink-0">
                    {item.final_score}
                  </div>
                </div>
                <hr className="border-black border-2 my-3"/>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span className="neo-badge bg-white">{item.genre || item.category}</span>
                  <span className="neo-badge bg-white">{item.sub_genre || item.sub_category}</span>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-100 p-3 neo-border rounded-lg text-sm font-bold">
                <div className="flex justify-between"><span>Tag Match:</span> <span>{item.tag_score}</span></div>
                <div className="flex justify-between"><span>Genre/Cat Bonus:</span> <span>{item.genre_score || item.category_score}</span></div>
                <div className="flex justify-between"><span>Sub-Gen Bonus:</span> <span>{item.sub_genre_score || item.sub_category_score}</span></div>
                <div className="flex justify-between"><span>Popularity:</span> <span>{item.popularity_score}</span></div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center font-bold p-10 neo-card bg-accent">
              No recommendations available. Log more events to get personalized picks!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
