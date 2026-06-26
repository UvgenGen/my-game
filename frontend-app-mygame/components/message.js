export default function Message({ post }) {
  const { id, message, user, publish_date: date } = post;
  return (
    <div className="p-4 rounded-lg bg-surface-2 border border-brd" key={id}>
      <footer className="flex items-center mb-2">
        <img className="mr-2 w-8 h-8 rounded-full ring-1 ring-brd" src={user?.profile_image_url} alt={user.username} />
        <p className="text-sm font-medium text-cyan">{user.username}</p>
      </footer>
      <p className="text-sm text-ink" dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, "<br />") }} />
    </div>
  );
}
