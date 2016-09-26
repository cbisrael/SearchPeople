using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using SearchPeople.Operations;
using SearchPeople.Models;
using System.IO;
using System.Threading;

namespace SearchPeople.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            //It does nothing but provide a way for the Index page to render.
            return View();
        }

        [HttpPost]
        public ActionResult SearchPeople(string person_name, int delay)
        {
            //Purpose: Execute the PeopleManager's SearchFolks to find any person 
            //         of which name contains any string in person_name.  Also execute delay
            //         by sleeping x seconds as specified in delay
            //Input:   person_name - string; the string to be used as a filter
            //         delay - string; 
            //Output:  model - collection of person object

            //Portion to simmulate slow network by sleeping x seconds as specified in the delay
            //parameter
            if (delay > 0)
            {                
                Thread.Sleep(delay * 1000);
            }

            //Call to people manager to search people
            PeopleManager sp = new PeopleManager();
            var model = sp.SearchFolks(person_name);
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdatePeople(person pers)
        {
            //Purpose: Create or update people data by calling the Save routine of PeopleManager.
            //Input:   pers - person object
            //Output:  strRet - json message of the update either Update complete or 
            //         Update failed!

            string strRet = "Update complete";            
            PeopleManager pplManage = new PeopleManager(pers);
            if(pers.pic_path != null)
                pers.pic_path = pers.pic_path.Replace("\"", "");
            if (!pplManage.Save())
                strRet = "Update failed!";

            return Json(strRet);
        }

        [HttpPost]
        public ActionResult Edit(int iperson)
        {
            //Purpose: Get the data of a person by parameter iperson
            //Input:   iperson - int id of a person
            //OUtput:  Json person object
            PeopleManager pm = new PeopleManager();
            person per = pm.GetPerson(iperson);
            return Json(per);
        }

        //File manipulations
        [HttpPost]
        public ActionResult MultiUpload()
        {
            //Purpose: Calls the FileManager's WriteFileFromInputStream.  This action is called
            //         from upload_chunk javascript routine and it is called recursively.  it will
            //         keep writing to the same file until the whole picture blob has been sent by the
            //         client. 
            //Input:   None
            //Output:  Json object with a value Succeeded uploading chunk 
            FileManager fleMgr = new FileManager();
            fleMgr.WriteFileFromInputStream();
            return Json("Succeeded uploading chunk");

        }

        [HttpPost]
        public ActionResult UploadComplete(string fileName)
        {
            //Purpose: Calls FileManager CompleteStreamWriting to finished off
            //         chunk_upload
            //Input:   fileName - the actual file name that was uploaded by the user.
            //         it is used to get the correct file extension
            //Ouput:   The new filename that was created to be used by the application
            FileManager fleMgr = new FileManager();
            string strPersonPic = fleMgr.CompleteStreamWriting(fileName);
            return Json(strPersonPic);
        }
    }
}