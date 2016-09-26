using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;

namespace SearchPeople.Operations
{
    public class FileManager
    {
        public bool WriteFileFromInputStream()
        {
            //Purpose: Read from the request's input stream a blob and write to a random file
            //Input:   None
            //Output:  bRetVal - boolean; true if successful and false otherwise
            
            bool bRetVal = true;

            FileStream fs = null;
            try
            {
                var chunks = System.Web.HttpContext.Current.Request.InputStream;
                string path = System.Web.HttpContext.Current.Server.MapPath("~/pictures");
                string newpath = "";


                if (System.Web.HttpContext.Current.Session["files"] == null)
                {
                    //this is the directory
                    newpath = Path.Combine(path, Path.GetRandomFileName());
                    while (System.IO.File.Exists(newpath))
                    {
                        newpath = Path.Combine(path, Path.GetRandomFileName());
                    }
                    fs = System.IO.File.Create(newpath);
                    System.Web.HttpContext.Current.Session["files"] = newpath; //this is the file
                }
                else
                {
                    newpath = Convert.ToString(System.Web.HttpContext.Current.Session["files"]);
                    fs = System.IO.File.Open(newpath, FileMode.Append);

                }


                byte[] bytes = new byte[77570];


                int bytesRead;
                while ((bytesRead = System.Web.HttpContext.Current.Request.InputStream.Read(bytes, 0, bytes.Length)) > 0)
                {
                    fs.Write(bytes, 0, bytesRead);
                }
                fs.Close();
                fs.Dispose();
            }
            catch
            {
                bRetVal = false;
            }            

            return bRetVal;
        }

        public string CompleteStreamWriting(string fileName)
        {
            //Purpose: 1. Create a temporary file. 2.  Get the extension of the file from filename.
            //         3. create a ne file name using temporary file + extension.  4.  move
            //         the uploaded file to this new file.  5.  return the complete filepath to be
            //         referenced by the html.  This will be saved in person.pic_path field
            //Input:  fileName - string file name
            //Output:  strPersonPic - string; the new file name
            string strFileSource = "";
            string strPersonPic = "";
            
            //get the source file path of the picture file that was just uploaded
            strFileSource = Convert.ToString(System.Web.HttpContext.Current.Session["files"]);
            //get the extension of the file from fileName passed by the front end.  this is the
            //file name of the file chosen by the user
            string strExt = Path.GetExtension(fileName);
            //Assemble a new file name
            string strFileName = Path.GetFileNameWithoutExtension(strFileSource) + strExt;            
            strPersonPic = System.Web.HttpContext.Current.Server.MapPath("~/pictures/" + strFileName);
            //move the uploaded file to this new file 
            System.IO.File.Move(strFileSource, strPersonPic);
            //set a return value to be written to pic_path
            strPersonPic = "/pictures/" + strFileName;
            System.Web.HttpContext.Current.Session["files"] = null;  //reset to null ready for new upload
            return strPersonPic;            
        }
    }

    
}