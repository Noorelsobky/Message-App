const prisma = require("../db");

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profilePicture: true,
      },
    });

    res.render("profile", {
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getEditProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profilePicture:true
      },
    });

    res.render("edit-profile", {
      user,
    });
  } catch (error) {
    next(error);
  }
};

const postEditProfile = async (req, res, next) => {
  try {
    const { bio } = req.body;

    const updateData = {
      bio: bio.trim(),
    };

    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: updateData,
    });

    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getEditProfile,
  postEditProfile,
};