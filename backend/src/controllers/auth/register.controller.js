export default async function registerController(req, res) {
  return res.status(403).json({
    success: false,
    msg: 'Direct registration is disabled. Sign in with Microsoft to create your account.',
  });
}
