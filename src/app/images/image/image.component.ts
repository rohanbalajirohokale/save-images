import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import {finalize} from 'rxjs/operators';
import { ImageService } from 'src/app/shared/image.service';
@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit {
  imgSrc!: string;
  selectedImage:any=null;
  isSubmitted:boolean=false;
 formTemplate=new FormGroup(
   {
     caption :new FormControl('',Validators.required),
     category :new FormControl(''),

     imageUrl :new FormControl('',Validators.required),


   }
 )
  constructor(private storage:AngularFireStorage,private service:ImageService) { }

  ngOnInit() {
    this.resetForm();

  }
  showPreview(event:any)
  {
    if(event.target.files && event.target.files[0])
    {
      const reader =new FileReader();
      reader.onload = (e:any)=>this.imgSrc =e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0]

    }
    else{
      this.imgSrc='https://i.pinimg.com/originals/0b/33/ee/0b33eebcf458abc39fbc654a19eb74b1.jpg';
      this.selectedImage= null;
    }
  }
  onSubmit(formValue:any)
  {
    this.isSubmitted=true;
    if(this.formTemplate.valid)
    {
      var filePath = `${formValue.category}/${this.selectedImage.name.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`;

      const fileRef =this.storage.ref(filePath);
      this.storage.upload(filePath,this.selectedImage).snapshotChanges().pipe(
        finalize(()=>{
          fileRef.getDownloadURL().subscribe((url)=>
          {
            formValue['imageUrl']=url;
             this.service.insertImageDetails(formValue)
            this.resetForm();

          })
        })
        
      ).subscribe();

    }

  }
 get formControls()
  {
    return this.formTemplate['controls'];
  }
  resetForm()
  {
    this.formTemplate.reset();
    this.formTemplate.setValue(
      {
        caption:'',
        imageUrl:'',
        category:'Education'
      }
    );
    this.imgSrc='/assets/image_placeholder.jpg';
    this.selectedImage = null;
    this.isSubmitted=false;
  }
}
