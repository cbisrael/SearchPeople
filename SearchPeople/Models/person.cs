//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace SearchPeople.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class person
    {
        public int iperson { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string sort_name { get; set; }
        public string address { get; set; }
        public string city { get; set; }
        public string zip { get; set; }
        public string state { get; set; }
        public Nullable<int> age { get; set; }
        public string interests { get; set; }
        public string pic_path { get; set; }
    }
}