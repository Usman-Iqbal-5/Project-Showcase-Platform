import express from "express";
import pg from "pg";
import passport from "passport";
import { Strategy } from "passport-local";
import bodyParser from "body-parser";
import session from "express-session";
import env from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import { cloudinary, storage } from "./cloudinary/index.js";

const app = express();
const port = 3000;
const saltrounds = 10;
const upload = multer({ storage });
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// checks if authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Oops Something went wrong!");
});

const getImages = async (projects) => {
  const projectIds = projects.map((p) => p.project_id);
  let mediaList = [];

  if (projectIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM media WHERE project_id = ANY($1) AND resource_type LIKE 'image/%'",
      [projectIds]
    );
    mediaList = mediaResult.rows || [];
  }

  projects.forEach((project) => {
    project.images = [];
  });

  mediaList.forEach((media) => {
    const project = projects.find((p) => p.project_id === media.project_id);
    if (project) project.images.push(media);
  });

  return projects;
};

const getVideos = async (projects) => {
  const projectIds = projects.map((p) => p.project_id);
  let mediaList = [];

  if (projectIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM media WHERE project_id = ANY($1) AND resource_type LIKE 'video/%'",
      [projectIds]
    );
    mediaList = mediaResult.rows || [];
  }

  projects.forEach((project) => {
    project.videos = [];
  });

  mediaList.forEach((media) => {
    const project = projects.find((p) => p.project_id === media.project_id);
    if (project) {
      project.videos.push(media);
    }
  });

  return projects;
};

const getFiles = async (projects) => {
  const projectIds = projects.map((p) => p.project_id);
  let mediaList = [];

  if (projectIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM media WHERE project_id = ANY($1) AND (resource_type NOT LIKE 'image/%' AND resource_type NOT LIKE 'video/%')",
      [projectIds]
    );
    mediaList = mediaResult.rows || [];
  }

  projects.forEach((project) => {
    project.files = [];
  });

  mediaList.forEach((media) => {
    const project = projects.find((p) => p.project_id === media.project_id);
    if (project) {
      project.files.push(media);
    }
  });

  return projects;
};

const getTags = async (projects) => {
  const projectIds = projects.map((p) => p.project_id);
  let tagList = [];

  if (projectIds.length > 0) {
    const tagsResult = await db.query(
      "SELECT tag_id, project_id, tag_name FROM project_tag WHERE project_id = ANY($1)",
      [projectIds]
    );
    tagList = tagsResult.rows || [];
  }

  projects.forEach((project) => {
    project.tags = [];
  });

  tagList.forEach((tag) => {
    const project = projects.find((p) => p.project_id === tag.project_id);
    if (project) {
      project.tags.push(tag);
    }
  });

  return projects;
};

const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.PORT,
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// checks using isAuthenicated middle to determine if user is authenticated or not
app.get("/profile", isAuthenticated, (req, res) => {
  //console.log(req.user);
  res.render("profile.ejs", {
    firstName: req.user.first_name,
    lastName: req.user.last_name,
  });
});

app.get("/createProfile", isAuthenticated, async (req, res) => {
  const student_id = req.user.student_id;

  const projectsResult = await db.query(
    "SELECT * FROM project WHERE student_id = $1 ORDER BY project_id ASC",
    [student_id]
  );

  const projects = projectsResult.rows;

  const projectsWithImages = await getImages(projects);
  const projectsWIthVideos = await getVideos(projectsWithImages);
  const projectsWithFiles = await getFiles(projectsWIthVideos);
  const projectsWithTags = await getTags(projectsWithFiles);

  //console.log(projectsWithTags);

  // console.log(JSON.stringify(projects, null, 2));
  //console.log("Projects: ", projects);
  //console.log("Media rows --: ", mediaList);

  res.render("createProfile.ejs", {
    projects: projectsWithTags,
    openForm: req.query.openForm,
  });
});

app.get("/editImages", isAuthenticated, async (req, res) => {
  const projectId = req.query.openForm;

  const projects = await db.query(
    "SELECT * FROM project WHERE project_id = $1 ORDER BY project_id ASC",
    [projectId]
  );

  //console.log("project where + project_id: ", projects.rows);

  const projectsWithImages = await getImages(projects.rows);
  //console.log("projects with images array", projectsWithImages);

  res.render("editImages.ejs", {
    project_id: projectId,
    projects: projectsWithImages,
  });
});

app.get("/editVideos", isAuthenticated, async (req, res) => {
  const projectId = req.query.openForm;

  const projects = await db.query(
    "SELECT * FROM project WHERE project_id = $1 ORDER BY project_id ASC",
    [projectId]
  );

  //console.log("project where + project_id: ", projects.rows);

  const projectsWithVideos = await getVideos(projects.rows);
  //console.log("projects with videos array", projectsWithVideos);

  res.render("editVideos.ejs", {
    project_id: projectId,
    projects: projectsWithVideos,
  });
});

app.post("/deleteProjectTag", async (req, res) => {
  const { tagId } = req.body;
  try {
    await db.query("DELETE FROM project_tag WHERE tag_id = $1", [tagId]);
    res.json({ success: true });
  } catch (err) {
    console.error("DB delete error:", err);
    res.status(500).json({ success: false });
  }
});

app.post("/DeleteImage", isAuthenticated, async (req, res) => {
  const { media_id, project_id } = req.body;

  try {
    const media = await db.query(
      "DELETE FROM media WHERE media_id = $1 RETURNING *",
      [media_id]
    );
    const publicIdToDelete = media.rows[0].public_id;
    await cloudinary.uploader.destroy(publicIdToDelete);

    //console.log(media.rows[0].publicIdToDelete);
    res.redirect(`/editImages?openForm=${project_id}`);
  } catch (error) {
    console.log(error);
    res.send(`Unable to remove image: ${error}`);
  }
});

app.post("/DeleteVideo", isAuthenticated, async (req, res) => {
  const { media_id, project_id } = req.body;

  try {
    const media = await db.query(
      "DELETE FROM media WHERE media_id = $1 RETURNING *",
      [media_id]
    );
    const publicIdToDelete = media.rows[0].public_id;
    await cloudinary.uploader.destroy(publicIdToDelete, {
      resource_type: "video",
    });

    //console.log(media.rows[0].public_id);
    res.redirect(`/editVideos?openForm=${project_id}`);
  } catch (error) {
    console.log(error);
    res.send(`Unable to remove video: ${error}`);
  }
});

app.post(
  "/uploadNewImage",
  isAuthenticated,
  upload.array("projectImage"),
  async (req, res) => {
    //console.log(req.body);
    const projectId = req.body.project_id;
    const images = req.files;

    try {
      for (const image of images) {
        //console.log(image);
        await db.query(
          "INSERT INTO media (project_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
          [
            projectId,
            image.filename,
            image.path,
            image.mimetype,
            image.originalname,
          ]
        );
      }
      return res.redirect(`/editImages?openForm=${projectId}`);
    } catch (error) {
      console.error(error);
      res.send("Unable to upload image: ", error);
    }
  }
);

app.post(
  "/uploadNewVideo",
  isAuthenticated,
  upload.array("projectVideo"),
  async (req, res) => {
    console.log(req.body);
    const projectId = req.body.project_id;
    const videos = req.files;

    try {
      for (const video of videos) {
        //console.log(video);
        await db.query(
          "INSERT INTO media (project_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
          [
            projectId,
            video.filename,
            video.path,
            video.mimetype,
            video.originalname,
          ]
        );
      }
      return res.redirect(`/editVideos?openForm=${projectId}`);
    } catch (error) {
      console.error(error);
      res.send("Unable to upload video: ", error);
    }
  }
);

app.post(
  "/addProject",
  isAuthenticated,
  upload.fields([
    { name: "projectImages", maxCount: 5 },
    { name: "projectVideos", maxCount: 3 },
    { name: "projectDocs", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const student_id = req.user.student_id;
      const projectTitle = req.body.title;
      const description = req.body.description;
      const explanation = req.body.explanation;
      const skillsArray = req.body.skills;

      const images = req.files.projectImages || [];
      const videos = req.files.projectVideos || [];
      const docs = req.files.projectDocs || [];

      // ✅ LOG FILES TO DEBUG
      //console.log("DOC FILES:", docs);

      const result = await db.query(
        "INSERT INTO project (student_id, project_name, description, job_explanation) VALUES ($1, $2, $3, $4) RETURNING *;",
        [
          student_id,
          projectTitle.trim(),
          description.trim(),
          explanation.trim(),
        ]
      );

      const projectId = result.rows[0].project_id;

      const saveMediaFiles = async (mediaArray) => {
        for (const file of mediaArray) {
          //console.log("Uploading:", file.originalname);
          await db.query(
            "INSERT INTO media (project_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
            [
              projectId,
              file.filename,
              file.path,
              file.mimetype,
              file.originalname,
            ]
          );
        }
      };

      await saveMediaFiles(images);
      await saveMediaFiles(videos);
      await saveMediaFiles(docs);

      const cleanedSkills = skillsArray.filter((skill) => skill.trim() !== "");

      if (cleanedSkills.length > 0) {
        for (const skill of cleanedSkills) {
          await db.query(
            "INSERT INTO project_tag (project_id, tag_name) VALUES ($1, $2)",
            [projectId, skill]
          );
        }
      }

      res.redirect("/createProfile");
    } catch (error) {
      console.error("Upload failed:", error); // 👈 SEE FULL ERROR
      res.status(500).send(`<pre>${JSON.stringify(error, null, 2)}</pre>`);
    }
  }
);

app.post("/saveProject", async (req, res) => {
  const {
    project_id,
    title,
    description,
    explanation,
    skills: skillsArray,
  } = req.body;
  console.log(req.body);
  console.log(skillsArray);

  try {
    await db.query(
      "UPDATE project SET project_name = $1, description = $2, job_explanation = $3 WHERE project_id = $4",
      [title.trim(), description.trim(), explanation.trim(), project_id]
    );

    // Delete all old tags for the project
    await db.query("DELETE FROM project_tag WHERE project_id = $1", [
      project_id,
    ]);

    if (Array.isArray(skillsArray) && skillsArray.length > 0) {
      // Insert new tags
      for (const skillName of skillsArray) {
        await db.query(
          "INSERT INTO project_tag (project_id, tag_name) VALUES ($1, $2)",
          [project_id, skillName.name]
        );
      }
    }

    res.redirect("/createProfile");
  } catch (error) {
    console.log("Unable to save project: " + error);
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/createProfile",
    failureRedirect: "/login?error=Login failed",
  })
);

app.post("/register", async (req, res) => {
  console.log(req.body);
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  let errorMessage = null;

  try {
    const result = await db.query("SELECT * FROM Student WHERE email=$1", [
      email,
    ]);

    if (result.rows.length > 0) {
      console.log("Already have an account");
    }
    const hash = await bcrypt.hash(password, saltrounds);
    const response = await db.query(
      "INSERT INTO student (first_name, last_name, email, hash) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstName, lastName, email, hash]
    );

    const user = response.rows[0];
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        errorMessage = "Failed to Login";
        return res.redirect(`/register?error=${errorMessage}`);
      }
      res.redirect("/profile");
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.redirect("/register?error=Server error");
  }
});

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // directs to the error handler
    }
    res.redirect("/login");
  });
});

app.delete("/eraseProject/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Check if project exists
    const projectQuery = "SELECT * FROM project WHERE project_id = $1";
    console.log("Running query:", projectQuery, projectId);
    const projectResult = await db.query(projectQuery, [projectId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get all media for the project
    const mediaQuery = "SELECT * FROM media WHERE project_id = $1";
    console.log("Running query:", mediaQuery, projectId);
    const mediaResult = await db.query(mediaQuery, [projectId]);
    const mediaItems = mediaResult.rows;

    // Delete each media from Cloudinary
    for (const media of mediaItems) {
      if (media.public_id) {
        let resourceType = "image"; // default

        if (media.resource_type) {
          if (media.resource_type.startsWith("video")) {
            resourceType = "video";
          } else if (
            media.resource_type === "application/octet-stream" ||
            media.resource_type.startsWith("application")
          ) {
            resourceType = "raw";
          } else if (media.resource_type.startsWith("image")) {
            resourceType = "image";
          }
        }

        try {
          await cloudinary.uploader.destroy(media.public_id, {
            resource_type: resourceType,
          });
        } catch (cloudErr) {
          console.warn(
            `Failed to delete Cloudinary resource ${media.public_id}: ${cloudErr.message}`
          );
        }
      }
    }

    // Delete media records from DB
    const deleteMediaQuery = "DELETE FROM media WHERE project_id = $1";
    console.log("Running query:", deleteMediaQuery, projectId);
    await db.query(deleteMediaQuery, [projectId]);

    // Delete project tags associated with this project
    const deleteTagsQuery = "DELETE FROM project_tag WHERE project_id = $1";
    console.log("Running query:", deleteTagsQuery, projectId);
    await db.query(deleteTagsQuery, [projectId]);

    // Delete the project itself
    const deleteProjectQuery = "DELETE FROM project WHERE project_id = $1";
    console.log("Running query:", deleteProjectQuery, projectId);
    await db.query(deleteProjectQuery, [projectId]);

    return res.json({
      message: "Project and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

const config = {
  usernameField: "email",
  passwordField: "password",
};

passport.use(
  "local",
  new Strategy(config, async (email, password, done) => {
    try {
      const result = await db.query("SELECT * FROM student WHERE email = $1", [
        email,
      ]);

      if (result.rows.length === 0) {
        return done(null, false, { message: "No user found" });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.hash); // returns boolean
      if (!isMatch) {
        return done(null, false, { message: "Invalid password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.student_id); // it then holds student_id in the session
});

passport.deserializeUser(async (student_id, done) => {
  // the server then use session iD (from the user cookie) to find the correct session and the student_id saved
  try {
    const result = await db.query(
      "SELECT * FROM student WHERE student_id = $1",
      [student_id]
    );
    done(null, result.rows[0]); // get fresh user data
  } catch (err) {
    done(err, null);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
