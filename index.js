//--- 8. Bölüm --- 12.03.2022
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/mongo-exercises")
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((err) => {
    console.error("Couldn't connect to MongoDB!", err);
  });

const courseSchema = new mongoose.Schema({
  //name: String,
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    //match: /pattern/, // belirli bir formatta text girişi de istenebilir...
  },
  category: {
    type: String,
    required: true,
    enum: ["web", "mobile", "network"], //kategori olarak sadece buradakilere uyan bir girişe izin verilir...
  },
  author: String,
  // tags için mesela string array isteniyor ama boş bir array de verilse doğrulama hatası olmuyor.
  // bu durumda custom validator kullanılması ve bunun elle yazılması gerekiyor.
  //tags: [String],
  tags: {
    type: Array,
    //required: true, // burada gereken custom validation olduğu için required bir anlam ifade etmez...
    validate: {
      validator: function (v) {
        //return v.minlength > 0; // böyle yazılırsa null olarak tanımlı olma durumunda istenmeyen şeyler olabilir.
        return v && v.minlength > 0; // kursta burada ".lenght" kullanıldı ama o işlev artık kullanılamıyor.
        // v tanımlı ve uzunluğu min 1 ise
      },
      message: "A course should have at least one tag!",
      // bu şekilde doğrulama hatası olursa kendi mesajımızı da görüntüleyebiliyoruz...
    },
  },
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  // Sadece yayınlanmış kurslar için (isPublished: true) aşağıdaki fonksiyon "true" döner
  // böylece sadece bu durumda "price" kısmı "required: true" olarak tanımlanır.
  // function () yerine () => KULLANILAMAZ!!! Çünkü unnamed fonksiyonların "this"
  // tanımlaması YOKTUR!!!
  //price: Number,
  price: {
    type: Number,
    required: function () {
      return this.isPublished;
      // mongoose içinden bir fonksiyon buradaki fonksiyonu çağıracak.
      // "this" ifadesi mongoose içindeki o fonksiyonu ifade eder. courseSchema'sını DEĞİL!!!
    },
    min: 10,
    max: 200, // bu iki doğrulayıcı "date" için de geçerlidir...
  },
});

const Course = mongoose.model("Course", courseSchema);

//****************************************************************************************** */
// Aşağıdaki fonksiyonda name, author ...vs gibi alanları yazmasak bile .save() metodu
// ile mongoDB kurs oluşturur ama içeriği hatalı ya da eksik olabilir. Bu nedenle yukarıdaki
// şemada değişiklik yapıp "required" (gerekli) alan tanımlamaları eklenmiştir. Bu tanımlamalar
// sadece mongoose için bir anlam ifade eder.
//****************************************************************************************** */
async function createCourse() {
  const course = new Course({
    name: "Angular Course",
    //category: "-",
    category: "web",
    author: "TA2LSM",
    //tags: ["angular", "frontend"],
    //tags: ["ab"],
    //tags: [],
    tags: null,
    //date: ...
    isPublished: true,
    price: 15,
  });

  // required bir alan olmadan .save() metodu çalışır ve hata dönerse aşağıdaki şekilde
  // handle etmek gerekiyor yoksa reject olan bir promise unhandled olarak kalır...
  try {
    //await course.validate();
    // kursta yukarıdaki metot kullanılıyor ama bu metot depricated (kullanımdan kalkma) olmuş.

    const result = await course.save();
    console.log(result);
  } catch (err) {
    //console.log(err);
    console.log(err.message);

    //kursta burada bir exception oluştuğu belirtiliyor. err yerine ex kullanılıyor...
  }
}

createCourse();

// async function getCourses() {
//   const pageNumber = 2;
//   const pageSize = 10;
//   // /api/courses?pageNumber=2&pageSize=10

//   const courses = await Course.find(/*{ author: "TA2LSM", isPublished: true }*/)
//     //.skip((pageNumber - 1) * pageSize)
//     //.limit(pageSize)
//     .sort({ name: 1 }); // 1: artan sırada, -1: azalan sırada sırala demek
//   //.select({ name: 1, tags: 1 }); // sadece name ve tags alanı dolu olanları bul
//   console.log(courses);
// }

// getCourses();

// async function updateCourse(id) {
//   // Approach 1: Query first, findById(), modify its properties, save()

//   // try {
//   //   // aşağıdaki fonksiyonun callback fonksiyonunun çağırılabilmesi için başına await
//   //   // eklemek gerekli...
//   //   await Course.findById(id, function (err, data) {
//   //     if (err) {
//   //       console.log("The course was not found!");
//   //       return;
//   //     } else {
//   //       console.log(data);
//   //     }
//   //   });
//   // } catch (err) {
//   //   return;
//   // }

//   //const course = await Course.find({ name: "Node.js Course" });
//   //const course = await Course.find({ _id: id });
//   const course = await Course.findById(id); // bu işlem zaman alacağı için async çalışır ve bir promise döner
//   if (!course) {
//     //course objesi NULL ise direkt böyle kontrol edebiliyor
//     console.log("The course was not found!");
//     return;
//   }

//   // Query first bazı durumları kontrol edip değişiklik yapmak için
//   // örneğin kurs zaten yayınlanmışsa yayıncısını değiştirmek olmaz...
//   // if (course.isPublished) {
//   //   console.log("The course has already been published!");
//   //   return;
//   // }

//   console.log(course);

//   // course.isPublished = false;
//   // course.author = "Modified Author!";
//   // Yukarıdaki kodlar yerine aşağıdaki kodlar da kullanılabilir.
//   course.set({
//     isPublished: true,
//     author: "Modified Author!",
//   });
//   //console.log(course);

//   const result = await course.save();
//   console.log(result);
// }

// async function updateCourse(id) {
//   // Approach 2: Update first, update directly, optionally get the updated document

//   // Kursta .update() metodu kullanılmış fakat bu metot artık yok. Onun yerine
//   // .findOne() ile adım adım gidildi. Aşağıdaki diğer fonksiyonda başka bir
//   // yöntem kullanıldı.
//   const course = await Course.findOne({ _id: id });
//   if (!course) {
//     //course objesi NULL ise direkt böyle kontrol edebiliyor
//     console.log("The course was not found!");
//     return;
//   }
//   console.log(course);

//   course.set({
//     isPublished: true,
//     author: "Modified Author!",
//   });
//   //console.log(course);

//   const result = await course.save();
//   console.log(result);
// }

// async function updateCourse(id) {
//   // Approach 2: Update first, update directly, optionally get the updated document
//   // MongoDB update operator kısmına kendi web sitesinden bakılabilir.
//   // $currentDate, $inc, $min, $max, $mul, $rename, $set, $unSet, $setOnInsert ...vs
//   // Fakat burada kurstaki yöntem kullanılamadığı için bu operatörlere gerek kalmadı !!!

//   // Aşağıda farklı farklı yöntemler gösterilmiştir...
//   // (1)
//   // const result = await Course.findByIdAndUpdate(id, {
//   //   isPublished: true,
//   //   author: "Modified Author!",
//   // });
//   // console.log(result);

//   // const course = await Course.findOne({ _id: id });
//   // console.log(course);

//   // (1_1)
//   // const course = await Course.findByIdAndUpdate(
//   //   id,
//   //   {
//   //     isPublished: true,
//   //     author: "Modified Author!",
//   //   },
//   //   { new: true } // bunu yazarsak değiştirilmiş dökümanı döner. Tekrar aramamıza gerek kalmaz.
//   // );
//   // console.log(course);

//   // (2)
//   const course = await Course.findOneAndUpdate(
//     id,
//     {
//       isPublished: true,
//       author: "Modified Author!",
//     },
//     { new: true }
//   );
//   console.log(course);

//   // const course = await Course.findOne({ _id: id });
//   // console.log(course);
// }

// MongoDB Compass'tan geçerli _id'ler alındı.
//updateCourse("5a68fdf95db93f6477053ddd"); // not published course
//updateCourse("5a68fdd7bee8ea64649c2777"); // published course

// async function removeCourse(id) {
//   //const result = Course.deleteOne({ isPublished: true });
//   // kritere uyan birden fazla sonuç varsa sadece ilkini siler.
//   //(1)
//   // const result = await Course.deleteOne({ _id: id });
//   // console.log(result);
//   //(2)
//   // const result = await Course.deleteMany({ isPublished: false });
//   // console.log(result);
//   //(3)
//   // .findByIdAndDelete() metodu da var
//   const course = await Course.findByIdAndRemove(id);
//   // ilgili kurs silinmişse ya da yoksa
//   if (!course) {
//     console.log("The course was not found!");
//     return;
//   }
//   console.log(course);
// }

// //removeCourse("5a68fdd7bee8ea64649c2777");
// //removeCourse("622b3e8e59bde2a4d15a8189");

// Ek olarak silinmiş kursu yerine koymak için yazıldı...
// async function createAdditionalCourse() {
//   const course = new Course({
//     _id: "622b3e8e59bde2a4d15a8189",
//     tags: ["node", "backend"],
//     date: "2018-01-24T21:42:47.912Z",
//     name: "Node.js Course (2)",
//     author: "TA2LSM",
//     isPublished: true,
//     price: 18,
//     __v: 0,
//   });

//   const result = await course.save();
//   console.log(result);
// }

// //createAdditionalCourse();
