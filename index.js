import express from "express";
import pg from "pg";
import passport from "passport";
import { Strategy } from "passport-local";
import bodyParser from "body-parser";
import session from "express-session";
import env from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import {
  cloudinary,
  projectStorage,
  experienceStorage,
} from "./cloudinary/index.js";

const app = express();
const port = 3000;
const saltrounds = 10;
const projectUpload = multer({ storage: projectStorage });
const experienceUpload = multer({ storage: experienceStorage });
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

function noCache(req, res, next) {
  //clear cache - so browser doesn't store pages with sensitve data
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("expires", "0");
  return next();
}

// checks if authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    noCache(req, res, next);
  } else {
    res.redirect("/login");
  }
}

//Middleware that allows all ejs templates to use userAuthenicated
app.use((req, res, next) => {
  res.locals.userAuthenticated = req.isAuthenticated();
  next();
});

const getImages = async (projects) => {
  const projectIds = projects.map((p) => p.project_id);
  let mediaList = [];

  if (projectIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM project_media WHERE project_id = ANY($1) AND resource_type LIKE 'image/%'",
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

const getExperienceImages = async (experiences) => {
  const experienceIds = experiences.map((e) => e.experience_id);
  let mediaList = [];

  if (experienceIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM experience_media WHERE experience_id = ANY($1) AND resource_type LIKE 'image/%'",
      [experienceIds]
    );
    mediaList = mediaResult.rows || [];
  }

  experiences.forEach((experience) => {
    experience.images = [];
  });

  mediaList.forEach((media) => {
    const experience = experiences.find(
      (e) => e.experience_id === media.experience_id
    );
    if (experience) experience.images.push(media);
  });

  return experiences;
};

const getVideos = async (projects) => {
  const projectIds = projects.map((p) => p.project_id);
  let mediaList = [];

  if (projectIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM project_media WHERE project_id = ANY($1) AND resource_type LIKE 'video/%'",
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

const getExperienceVideos = async (experiences) => {
  const experienceIds = experiences.map((e) => e.experience_id);
  let mediaList = [];

  if (experienceIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM experience_media WHERE experience_id = ANY($1) AND resource_type LIKE 'video/%'",
      [experienceIds]
    );
    mediaList = mediaResult.rows || [];
  }

  experiences.forEach((experience) => {
    experience.videos = [];
  });

  mediaList.forEach((media) => {
    const experience = experiences.find(
      (e) => e.experience_id === media.experience_id
    );
    if (experience) {
      experience.videos.push(media);
    }
  });

  return experiences;
};

const getFiles = async (projects) => {
  const projectIds = projects.map((p) => p.project_id);
  let mediaList = [];

  if (projectIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM project_media WHERE project_id = ANY($1) AND (resource_type NOT LIKE 'image/%' AND resource_type NOT LIKE 'video/%')",
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

const getExperienceFiles = async (experiences) => {
  const experienceIds = experiences.map((e) => e.experience_id);
  let mediaList = [];

  if (experienceIds.length > 0) {
    const mediaResult = await db.query(
      "SELECT * FROM experience_media WHERE experience_id = ANY($1) AND (resource_type NOT LIKE 'image/%' AND resource_type NOT LIKE 'video/%')",
      [experienceIds]
    );
    mediaList = mediaResult.rows || [];
  }

  experiences.forEach((experience) => {
    experience.files = [];
  });

  mediaList.forEach((media) => {
    const experience = experiences.find(
      (e) => e.experience_id === media.experience_id
    );
    if (experience) {
      experience.files.push(media);
    }
  });

  return experiences;
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

const getExperienceTags = async (experiences) => {
  const experienceIds = experiences.map((e) => e.experience_id);
  let tagList = [];

  if (experienceIds.length > 0) {
    const tagsResult = await db.query(
      "SELECT tag_id, experience_id, tag_name FROM experience_tag WHERE experience_id = ANY($1)",
      [experienceIds]
    );
    tagList = tagsResult.rows || [];
  }

  experiences.forEach((experience) => {
    experience.tags = [];
  });

  tagList.forEach((tag) => {
    const experience = experiences.find(
      (e) => e.experience_id === tag.experience_id
    );
    if (experience) {
      experience.tags.push(tag);
    }
  });

  return experiences;
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

app.get("/login", noCache, (req, res) => {
  const error = req.query.error;
  console.log(error);
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  res.render("login.ejs", { error });
});

// checks using isAuthenicated middle to determine if user is authenticated or not
app.get("/profile", isAuthenticated, (req, res) => {
  //console.log(req.user);
  res.render("profile.ejs", {
    firstName: req.user.first_name,
    lastName: req.user.last_name,
  });
});

/* This section deals with the the Project Uploadd*/

app.get("/createProfile", isAuthenticated, async (req, res) => {
  const student_id = req.user.student_id;

  try {
    //Student Details
    const result = await db.query(
      "SELECT student_id, first_name, last_name, email, phone_number, title, degree_name, about_me from student WHERE student_id = $1",
      [student_id]
    );
    const student = result.rows[0];
    //Projects

    const projectsResult = await db.query(
      "SELECT * FROM project WHERE student_id = $1 ORDER BY project_id ASC",
      [student_id]
    );

    const projects = projectsResult.rows;

    const projectsWithImages = await getImages(projects);
    const projectsWithVideos = await getVideos(projectsWithImages);
    const projectsWithFiles = await getFiles(projectsWithVideos);
    const projectsWithTags = await getTags(projectsWithFiles);

    //console.log(projectsWithTags);

    // console.log(JSON.stringify(projects, null, 2));
    //console.log("Projects: ", projects);
    //console.log("Media rows --: ", mediaList);

    //Experiences

    const experienceResult = await db.query(
      "SELECT * FROM experience WHERE student_id = $1 ORDER BY experience_id ASC",
      [student_id]
    );

    const experiences = experienceResult.rows;

    const experiencesWithImages = await getExperienceImages(experiences);
    const experiencesWithVideos = await getExperienceVideos(
      experiencesWithImages
    );
    const experiencesWithFiles = await getExperienceFiles(
      experiencesWithVideos
    );
    const experiencesWithTags = await getExperienceTags(experiencesWithFiles);

    res.render("createProfile.ejs", {
      student: student,
      projects: projectsWithTags,
      experiences: experiencesWithTags,
      openForm: req.query.openForm,
    });
  } catch (error) {
    console.log(error);
    window.log(error);
    res.status(500).redirect("/profile");
  }
});

app.get("/editExperienceImages", isAuthenticated, async (req, res) => {
  const experienceId = req.query.openForm;

  const experiences = await db.query(
    "SELECT * FROM experience WHERE experience_id = $1 ORDER BY experience_id ASC",
    [experienceId]
  );

  //console.log("project where + project_id: ", projects.rows);

  const experiencesWithImages = await getExperienceImages(experiences.rows);
  //console.log("projects with images array", projectsWithImages);

  res.render("editExperienceImages.ejs", {
    experience_id: experienceId,
    experiences: experiencesWithImages,
  });
});

app.get("/editExperienceFiles", isAuthenticated, async (req, res) => {
  const experienceId = req.query.openForm;

  const experiences = await db.query(
    "SELECT * FROM experience WHERE experience_id = $1 ORDER BY experience_id ASC",
    [experienceId]
  );

  //console.log("project where + project_id: ", projects.rows);

  const experiencesWithFiles = await getExperienceFiles(experiences.rows);
  //console.log("projects with images array", projectsWithImages);

  res.render("editExperienceFiles.ejs", {
    experience_id: experienceId,
    experiences: experiencesWithFiles,
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

app.get("/editFiles", isAuthenticated, async (req, res) => {
  const projectId = req.query.openForm;

  const projects = await db.query(
    "SELECT * FROM project WHERE project_id = $1 ORDER BY project_id ASC",
    [projectId]
  );

  //console.log("project where + project_id: ", projects.rows);

  const projectsWithFiles = await getFiles(projects.rows);
  //console.log("projects with videos array", projectsWithVideos);

  res.render("editFiles.ejs", {
    project_id: projectId,
    projects: projectsWithFiles,
  });
});

app.get("/editExperienceVideos", isAuthenticated, async (req, res) => {
  const experienceId = req.query.openForm;

  const experience = await db.query(
    "SELECT * FROM experience WHERE experience_id = $1 ORDER BY experience_id ASC",
    [experienceId]
  );

  //console.log("project where + project_id: ", projects.rows);

  const experiencesWithVideos = await getExperienceVideos(experience.rows);
  //console.log("projects with videos array", projectsWithVideos);

  res.render("editExperienceVideos.ejs", {
    experience_id: experienceId,
    experiences: experiencesWithVideos,
  });
});

app.get("/projectsPage", isAuthenticated, async (req, res) => {
  const student = req.user;
  //console.log(student);

  const results = await db.query(
    "SELECT * FROM project WHERE student_id = $1 ORDER BY student_id ASC",
    [student.student_id]
  );

  const projectsRows = results.rows;
  const projectsWithImages = await getImages(projectsRows);
  const projectsWithTags = await getTags(projectsWithImages);
  //console.log(projectsWithTags);

  res.render("projectsPage.ejs", {
    projects: projectsWithTags,
    student,
  });
});

app.get("/experiencesPage", isAuthenticated, async (req, res) => {
  const student = req.user;
  //console.log(student);

  const results = await db.query(
    "SELECT * FROM experience WHERE student_id = $1 ORDER BY student_id ASC",
    [student.student_id]
  );

  const experiencesRows = results.rows;
  const experiencesWithImages = await getExperienceImages(experiencesRows);
  const experiencesWithTags = await getExperienceTags(experiencesWithImages);
  //console.log(projectsWithTags);

  res.render("experiencesPage.ejs", {
    experiences: experiencesWithTags,
    student,
  });
});

app.get("/project/:project_id", isAuthenticated, async (req, res, next) => {
  const projectId = req.params.project_id;
  const studentId = req.user.student_id;

  try {
    const result = await db.query(
      "SELECT * FROM project WHERE project_id = $1 AND student_id = $2",
      [projectId, studentId]
    );
    const project = result.rows;

    if (Array.isArray(project) && project.length === 0) {
      // No project found → pass a 404 error to the error handler
      const err = new Error("Project not found");
      err.status = 404;
      return next(err);
    }

    // console.log("porjects (no image, not tags, no videos", project);
    const projectsWithTags = await getTags(project);
    // console.log("projects with tags", projectsWithTags);
    const projectsWithImages = await getImages(projectsWithTags);
    // console.log("projects wirh images", projectsWithImages);
    const projectsWithVideos = await getVideos(projectsWithImages);
    // console.log("This is the projects with videos:", projectsWithVideos);
    const projectsWithFiles = await getFiles(projectsWithVideos);
    // console.log(
    //   "images that is printed to the profile page:",
    //   JSON.stringify(projectsWithVideos[0].images)
    // );

    // console.log(projectsWithVideos[0].template_value);
    if (projectsWithFiles[0].template_value == 1) {
      return res.render("template1.ejs", {
        activity: projectsWithFiles[0],
        type: "project",
      });
    } else {
      return res.render("template2.ejs", {
        activity: projectsWithFiles[0],
        type: "project",
      });
    }
  } catch (error) {
    console.log("error");
    next(error);
  }
});

app.get(
  "/experience/:experience_id",
  isAuthenticated,
  async (req, res, next) => {
    const experienceId = req.params.experience_id;
    const studentId = req.user.student_id;

    try {
      const result = await db.query(
        "SELECT * FROM experience WHERE experience_id = $1 AND student_id = $2",
        [experienceId, studentId]
      );
      const experience = result.rows;

      if (Array.isArray(experience) && experience.length === 0) {
        // No project found → pass a 404 error to the error handler
        const err = new Error("Project not found");
        err.status = 404;
        return next(err);
      }

      // console.log("porjects (no image, not tags, no videos", project);
      const experiencesWithTags = await getExperienceTags(experience);
      // console.log("projects with tags", projectsWithTags);
      const experiencesWithImages = await getExperienceImages(
        experiencesWithTags
      );
      // console.log("projects wirh images", projectsWithImages);
      const experiencesWithVideos = await getExperienceVideos(
        experiencesWithImages
      );
      const experiencesWithFiles = await getExperienceFiles(
        experiencesWithVideos
      );
      // console.log("This is the projects with videos:", projectsWithVideos);

      // console.log(
      //   "images that is printed to the profile page:",
      //   JSON.stringify(projectsWithVideos[0].images)
      // );

      // console.log(projectsWithVideos[0].template_value);
      if (experiencesWithFiles[0].template_value == 1) {
        return res.render("template1.ejs", {
          activity: experiencesWithFiles[0],
          type: "experience",
        });
      } else {
        return res.render("template2.ejs", {
          activity: experiencesWithFiles[0],
          type: "experience",
        });
      }
    } catch (error) {
      console.log("error");
      next(error);
    }
  }
);

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.post("/uploadProfileDetails", isAuthenticated, async (req, res) => {
  const student_id = req.user.student_id;
  const student = req.body;
  //console.log(`User: ${JSON.stringify(req.user)}`);

  try {
    const result = await db.query(
      "UPDATE student SET first_name = $1, last_name = $2, email = $3, phone_number = $4, title = $5, degree_name = $6, about_me = $7 WHERE student_id = $8 RETURNING *",
      [
        student.first_name.trim(),
        student.last_name.trim(),
        student.email.trim(),
        student.phone_number.trim(),
        student.title.trim(),
        student.degree_name.trim(),
        student.about_me.trim(),
        student_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: "Student not found" });
    }

    res.redirect("/createProfile?update=Successful");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).redirect("/createProfile?update=failed");
  }
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

app.post("/deleteExperienceTag", async (req, res) => {
  const { tagId } = req.body;
  try {
    await db.query("DELETE FROM experience_tag WHERE tag_id = $1", [tagId]);
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
      "DELETE FROM project_media WHERE media_id = $1 RETURNING *",
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

app.post("/DeleteFile", isAuthenticated, async (req, res) => {
  const { media_id, project_id } = req.body;

  try {
    const media = await db.query(
      "DELETE FROM project_media WHERE media_id = $1 RETURNING *",
      [media_id]
    );
    const publicIdToDelete = media.rows[0].public_id;
    await cloudinary.uploader.destroy(publicIdToDelete, {
      resource_type: "raw",
    });

    console.log(media.rows[0].publicIdToDelete);
    res.redirect(`/editFiles?openForm=${project_id}`);
  } catch (error) {
    console.log(error);
    res.send(`Unable to remove image: ${error}`);
  }
});

app.post("/DeleteExperienceFile", isAuthenticated, async (req, res) => {
  const { media_id, experience_id } = req.body;

  try {
    const media = await db.query(
      "DELETE FROM experience_media WHERE media_id = $1 RETURNING *",
      [media_id]
    );
    const publicIdToDelete = media.rows[0].public_id;
    await cloudinary.uploader.destroy(publicIdToDelete, {
      resource_type: "raw",
    });

    console.log(media.rows[0].publicIdToDelete);
    res.redirect(`/editExperienceFiles?openForm=${experience_id}`);
  } catch (error) {
    console.log(error);
    res.send(`Unable to remove image: ${error}`);
  }
});

app.post("/DeleteExperienceImage", isAuthenticated, async (req, res) => {
  const { media_id, experience_id } = req.body;

  try {
    const media = await db.query(
      "DELETE FROM experience_media WHERE media_id = $1 RETURNING *",
      [media_id]
    );
    const publicIdToDelete = media.rows[0].public_id;
    await cloudinary.uploader.destroy(publicIdToDelete);

    //console.log(media.rows[0].publicIdToDelete);
    res.redirect(`/editExperienceImages?openForm=${experience_id}`);
  } catch (error) {
    console.log(error);
    res.send(`Unable to remove image: ${error}`);
  }
});

app.post("/DeleteVideo", isAuthenticated, async (req, res) => {
  const { media_id, project_id } = req.body;

  try {
    const media = await db.query(
      "DELETE FROM project_media WHERE media_id = $1 RETURNING *",
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

app.post("/DeleteExperienceVideo", isAuthenticated, async (req, res) => {
  const { media_id, experience_id } = req.body;

  try {
    const media = await db.query(
      "DELETE FROM experience_media WHERE media_id = $1 RETURNING *",
      [media_id]
    );
    const publicIdToDelete = media.rows[0].public_id;
    await cloudinary.uploader.destroy(publicIdToDelete, {
      resource_type: "video",
    });

    //console.log(media.rows[0].public_id);
    res.redirect(`/editExperienceVideos?openForm=${experience_id}`);
  } catch (error) {
    console.log(error);
    res.send(`Unable to remove video: ${error}`);
  }
});

app.post(
  "/uploadNewImage",
  isAuthenticated,
  projectUpload.array("projectImage"),
  async (req, res) => {
    //console.log(req.body);
    const projectId = req.body.project_id;
    const images = req.files;

    try {
      for (const image of images) {
        //console.log(image);
        await db.query(
          "INSERT INTO project_media (project_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
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
  "/uploadNewFile",
  isAuthenticated,
  projectUpload.array("projectFile"),
  async (req, res) => {
    //console.log(req.body);
    const projectId = req.body.project_id;
    const files = req.files;

    try {
      for (const file of files) {
        //console.log(image);
        await db.query(
          "INSERT INTO project_media (project_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
          [
            projectId,
            file.filename,
            file.path,
            file.mimetype,
            file.originalname,
          ]
        );
      }
      return res.redirect(`/editFiles?openForm=${projectId}`);
    } catch (error) {
      console.error(error);
      res.send("Unable to upload file: ", error);
    }
  }
);

app.post(
  "/uploadNewExperienceImage",
  isAuthenticated,
  experienceUpload.array("experienceImage"),
  async (req, res) => {
    //console.log(req.body);
    const experienceId = req.body.experience_id;
    const images = req.files;

    try {
      for (const image of images) {
        //console.log(image);
        await db.query(
          "INSERT INTO experience_media (experience_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
          [
            experienceId,
            image.filename,
            image.path,
            image.mimetype,
            image.originalname,
          ]
        );
      }
      return res.redirect(`/editExperienceImages?openForm=${experienceId}`);
    } catch (error) {
      console.error(error);
      res.send("Unable to upload image: ", error);
    }
  }
);

app.post(
  "/uploadNewExperienceFile",
  isAuthenticated,
  experienceUpload.array("experienceFile"),
  async (req, res) => {
    //console.log(req.body);
    const experienceId = req.body.experience_id;
    const files = req.files;

    try {
      for (const file of files) {
        //console.log(image);
        await db.query(
          "INSERT INTO experience_media (experience_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
          [
            experienceId,
            file.filename,
            file.path,
            file.mimetype,
            file.originalname,
          ]
        );
      }
      return res.redirect(`/editExperienceFiles?openForm=${experienceId}`);
    } catch (error) {
      console.error(error);
      res.send("Unable to upload file: ", error);
    }
  }
);

app.post(
  "/uploadNewVideo",
  isAuthenticated,
  projectUpload.array("projectVideo"),
  async (req, res) => {
    console.log(req.body);
    const projectId = req.body.project_id;
    const videos = req.files;

    try {
      for (const video of videos) {
        //console.log(video);
        await db.query(
          "INSERT INTO project_media (project_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
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
  "/uploadNewExperienceVideo",
  isAuthenticated,
  experienceUpload.array("experienceVideo"),
  async (req, res) => {
    console.log(req.body);
    const experienceId = req.body.experience_id;
    const videos = req.files;

    try {
      for (const video of videos) {
        //console.log(video);
        await db.query(
          "INSERT INTO experience_media (experience_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
          [
            experienceId,
            video.filename,
            video.path,
            video.mimetype,
            video.originalname,
          ]
        );
      }
      return res.redirect(`/editExperienceVideos?openForm=${experienceId}`);
    } catch (error) {
      console.error(error);
      res.send("Unable to upload video: ", error);
    }
  }
);

app.post(
  "/addProject",
  isAuthenticated,
  projectUpload.fields([
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
      const template = req.body.template;
      const skillsArray = req.body.skills;

      const images = req.files.projectImages || [];
      const videos = req.files.projectVideos || [];
      const docs = req.files.projectDocs || [];

      // LOG FILES TO DEBUG
      //console.log("DOC FILES:", docs);

      const result = await db.query(
        "INSERT INTO project (student_id, project_name, description, template_value, job_explanation) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
        [
          student_id,
          projectTitle.trim(),
          description.trim(),
          template,
          explanation.trim(),
        ]
      );

      const projectId = result.rows[0].project_id;

      const saveMediaFiles = async (mediaArray) => {
        for (const file of mediaArray) {
          //console.log("Uploading:", file.originalname);
          await db.query(
            "INSERT INTO project_media (project_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
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
    template,
    skills: skillsArray,
  } = req.body;
  console.log(req.body);
  console.log(skillsArray);

  try {
    await db.query(
      "UPDATE project SET project_name = $1, description = $2, template_value =$3, job_explanation = $4 WHERE project_id = $5",
      [
        title.trim(),
        description.trim(),
        template,
        explanation.trim(),
        project_id,
      ]
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

app.post("/saveExperience", async (req, res) => {
  const {
    experience_id,
    title,
    description,
    explanation,
    template,
    skills: skillsArray,
  } = req.body;
  console.log(req.body);
  console.log(skillsArray);

  try {
    await db.query(
      "UPDATE experience SET experience_name = $1, description = $2, template_value = $3, job_explanation = $4 WHERE experience_id = $5",
      [
        title.trim(),
        description.trim(),
        template,
        explanation.trim(),
        experience_id,
      ]
    );

    // Delete all old tags for the project
    await db.query("DELETE FROM experience_tag WHERE experience_id = $1", [
      experience_id,
    ]);

    if (Array.isArray(skillsArray) && skillsArray.length > 0) {
      // Insert new tags
      for (const skillName of skillsArray) {
        await db.query(
          "INSERT INTO experience_tag (experience_id, tag_name) VALUES ($1, $2)",
          [experience_id, skillName.name]
        );
      }
    }

    res.redirect("/createProfile");
  } catch (error) {
    console.log("Unable to save project: " + error);
  }
});

/* This section deals with the Epxeirences*/

app.post(
  "/addExperience",
  isAuthenticated,
  experienceUpload.fields([
    { name: "experienceImages", maxCount: 5 },
    { name: "experienceVideos", maxCount: 3 },
    { name: "experienceDocs", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const student_id = req.user.student_id;
      const experienceTitle = req.body.title;
      const description = req.body.description;
      const explanation = req.body.explanation;
      const template = req.body.template;
      const skillsArray = req.body.experienceSkills;

      const images = req.files.experienceImages || [];
      const videos = req.files.experienceVideos || [];
      const docs = req.files.experienceDocs || [];

      // LOG FILES TO DEBUG
      //console.log("DOC FILES:", docs);

      const result = await db.query(
        "INSERT INTO experience (student_id, experience_name, description, template_value, job_explanation) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
        [
          student_id,
          experienceTitle.trim(),
          description.trim(),
          template,
          explanation.trim(),
        ]
      );

      const experienceId = result.rows[0].experience_id;

      const saveMediaFiles = async (mediaArray) => {
        for (const file of mediaArray) {
          //console.log("Uploading:", file.originalname);
          await db.query(
            "INSERT INTO experience_media (experience_id, public_id, secure_url, resource_type, original_filename) VALUES ($1, $2, $3, $4, $5);",
            [
              experienceId,
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
            "INSERT INTO experience_tag (experience_id, tag_name) VALUES ($1, $2)",
            [experienceId, skill]
          );
        }
      }

      res.redirect("/createProfile");
    } catch (error) {
      console.error("Upload failed:", error);
      res.status(500).send(`<pre>${JSON.stringify(error, null, 2)}</pre>`);
    }
  }
);

/* This section deals with the the authenitcation and sessions*/

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/projectsPage",
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

    // Starts a session for this user (no password check; user already verified/created)
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
    const mediaQuery = "SELECT * FROM project_media WHERE project_id = $1";
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
    const deleteMediaQuery = "DELETE FROM project_media WHERE project_id = $1";
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

app.delete("/eraseExperience/:experienceId", async (req, res) => {
  const experienceId = req.params.experienceId;

  try {
    // Check if project exists
    const experienceQuery = "SELECT * FROM experience WHERE experience_id = $1";
    console.log("Running query:", experienceQuery, experienceId);
    const experienceResult = await db.query(experienceQuery, [experienceId]);

    if (experienceResult.rows.length === 0) {
      return res.status(404).json({ error: "Experience not found" });
    }

    // Get all media for the project
    const mediaQuery =
      "SELECT * FROM experience_media WHERE experience_id = $1";
    console.log("Running query:", mediaQuery, experienceId);
    const mediaResult = await db.query(mediaQuery, [experienceId]);
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
    const deleteMediaQuery =
      "DELETE FROM experience_media WHERE experience_id = $1";
    console.log("Running query:", deleteMediaQuery, experienceId);
    await db.query(deleteMediaQuery, [experienceId]);

    // Delete project tags associated with this project
    const deleteTagsQuery =
      "DELETE FROM experience_tag WHERE experience_id = $1";
    console.log("Running query:", deleteTagsQuery, experienceId);
    await db.query(deleteTagsQuery, [experienceId]);

    // Delete the project itself
    const deleteExperienceQuery =
      "DELETE FROM experience WHERE experience_id = $1";
    console.log("Running query:", deleteExperienceQuery, experienceId);
    await db.query(deleteExperienceQuery, [experienceId]);

    return res.json({
      message: "Project and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Failed to delete project" });
  }
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

//404 handler - catches requests that didn’t match any route.
app.use((req, res, next) => {
  const err = new Error("Page not found");
  err.status = 404;
  next(err); // Pass to the error handler
});

// catches any error that is passed to next
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error.ejs", {
    message: err.message,
    status: err.status || 500,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
