export default function Message({ post }) {
  const {id, message, user, publish_date: date} = post;
  return (
    <div className="p-6 mb-6 text-base bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900" key={id}>
      <footer className="flex justify-between items-center mb-2">
          <div className="flex items-center">
              <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white">
                <img
                  className="mr-2 w-10 h-10 rounded-full"
                  src={user?.profile_image_url}
                  alt={user.username}/>
                {user.username}
              </p>
          </div>
      </footer>
      <p className="text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{__html: message.replace(/\n/g, "<br />")}}/>
    </div>
  )
}
