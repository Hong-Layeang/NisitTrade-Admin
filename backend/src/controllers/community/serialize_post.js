import { presignIfS3Url } from '../../utils/s3-presigned-url.js';

export default async function serializeCommunityPost(post, {
  includeComments = false,
} = {}) {
  const json = post.toJSON();

  const imageUrls = Array.isArray(json.image_urls) && json.image_urls.length > 0
    ? json.image_urls
    : json.image_url
      ? [json.image_url]
      : [];

  const presignedImageUrls = await Promise.all(
    imageUrls.map((url) => presignIfS3Url(url)),
  );

  const userProfileImage = json.User?.profile_image
    ? await presignIfS3Url(json.User.profile_image)
    : json.User?.profile_image;

  const myLike = Array.isArray(json.CommunityPostLikes)
    ? json.CommunityPostLikes[0]
    : null;

  let comments = undefined;
  if (includeComments) {
    const rawComments = Array.isArray(json.CommunityPostComments)
      ? json.CommunityPostComments
      : [];

    comments = await Promise.all(
      rawComments.map(async (comment) => {
        const commentUserProfile = comment.User?.profile_image
          ? await presignIfS3Url(comment.User.profile_image)
          : comment.User?.profile_image;

        return {
          ...comment,
          User: comment.User
            ? {
                ...comment.User,
                profile_image: commentUserProfile,
              }
            : comment.User,
        };
      }),
    );
  }

  return {
    ...json,
    User: json.User
      ? {
          ...json.User,
          profile_image: userProfileImage,
        }
      : json.User,
    image_url: presignedImageUrls[0] ?? await presignIfS3Url(json.image_url),
    image_urls: presignedImageUrls,
    is_liked_by_me: Boolean(myLike),
    my_like_id: myLike?.id ?? null,
    comments: comments,
  };
}