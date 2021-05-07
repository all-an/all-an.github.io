#include <stdio.h>
#include <stdlib.h>

int *p;
int x;

int main(){
	x = 10;
	p = &x;
	x = 20;
	*p = 30;
	printf("%p",p);
	printf("\nhi");
}

  //Learning how to declare variables and a pointer
  



