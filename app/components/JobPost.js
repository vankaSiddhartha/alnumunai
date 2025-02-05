export default function JobPost({ post, onApply }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={post.companyLogo || '/api/placeholder/100/100'} 
          alt={post.company} 
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div>
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-gray-600">{post.company}</p>
        </div>
      </div>

      <p className="mb-4 text-gray-700">{post.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {post.skills.map((skill) => (
          <span 
            key={skill} 
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          Posted by {post.postedBy} • {post.location}
        </div>
        <button 
          onClick={() => onApply(post.id)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  )
}
