import { Global, Module } from "@nestjs/common";
import { StudentModule } from "@module/student/student.module";
import { UserModule } from "@module/user/user.module";
import { LookupService } from "./lookup.service";

@Global()
@Module({
    imports: [UserModule, StudentModule],
    providers: [LookupService],
    exports: [LookupService],
})
export class LookupModule {}
