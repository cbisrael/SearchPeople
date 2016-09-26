using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SearchPeople.Models;
using System.Data.Entity;

namespace SearchPeople.Operations
{
    
    public class PeopleManager
    {
        people_dbEntities db = new people_dbEntities();
        private person m_pers;
        public PeopleManager(){}

        public PeopleManager(person p) { m_pers = p; }

        public List<person> SearchFolks(string strFilter)
        {
            var ppl = db.people.AsQueryable();
            if(!string.IsNullOrWhiteSpace(strFilter))
            {
                ppl = ppl.Where(pl => pl.sort_name.Contains(strFilter));

            }
            var model = ppl.OrderBy(o => o.sort_name).ToList();
            return model;
        }

        public bool Save()
        {
            //Purpose: Save pereson data to person table
            //Input:   None
            //Output:  boolean - True if successful and false otherwise
            bool bRet = true;
            try
            {
                if (m_pers.iperson > 0)
                {
                    db.people.Attach(m_pers);
                    db.Entry(m_pers).State = EntityState.Modified;
                    bRet = DeleteImage();
                }
                else
                    db.people.Add(m_pers);
                if(bRet)
                    db.SaveChanges();
            }
            catch
            {
                bRet = false;
            }

            return bRet;
        }

        public person GetPerson(int id)
        {
            person pers = db.people.Where(x => x.iperson == id).FirstOrDefault();
            return pers;
        }

        private bool DeleteImage()
        {
            bool bRetVal = true;

            try
            {
                var perq = from p in db.people where p.iperson == m_pers.iperson
                           select new { p.pic_path };
                string strPicPath = "";
                foreach (var p in perq)
                {                    
                    strPicPath = p.pic_path;
                }

                if (strPicPath == null)
                    strPicPath = "";
                //if the file name are different, we are uploading a new file
                if(strPicPath.Length > 0)
                {
                    if (strPicPath.IndexOf(m_pers.pic_path) < 0)
                    {
                        string strDelFile = System.Web.HttpContext.Current.Server.MapPath(strPicPath);
                        if (System.IO.File.Exists(strDelFile))
                            System.IO.File.Delete(strDelFile);
                    }
                }
                
                
            }
            catch {
                bRetVal = false;
            }

            
            return bRetVal;
            
        }
       
    }
}